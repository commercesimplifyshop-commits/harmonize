import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Injectable,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import type { AdminEvent, EventCategory, EventInput, EventItem } from '@harmonize/shared';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import type { PoolConnection } from 'mysql2/promise';
import { AdminGuard } from '../auth/auth.guard';
import { DbService } from '../db/db.service';
import { mediaColumns, pickMedia, toMedia, toMediaRecord, type MediaRow } from '../media/media.mapper';

export const CATEGORIES: EventCategory[] = ['casamento', 'quinze-anos', 'aniversario', 'bodas', 'cha', 'corporativo', 'outro'];
const MAX_GALLERY = 60;

export class EventDto implements EventInput {
  @IsString() @MinLength(2, { message: 'Dê um título ao evento.' }) @MaxLength(200) title: string;
  @IsOptional() @IsString() @MaxLength(160) slug?: string;
  @IsIn(CATEGORIES, { message: 'Tipo de evento inválido.' }) category: EventCategory;
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data inválida.' }) date: string;
  @IsOptional() @ValidateIf((_, v) => v !== null) @IsString() @MaxLength(200) location?: string | null;
  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt() @Min(0) @Max(100000) guests?: number | null;
  @IsString() @MaxLength(400) summary: string;
  @IsString() @MaxLength(20000) description: string;
  @ValidateIf((_, v) => v !== null) @IsInt() coverMediaId: number | null;
  @IsArray() @ArrayMaxSize(MAX_GALLERY, { message: `No máximo ${MAX_GALLERY} fotos por evento.` }) @IsInt({ each: true }) galleryMediaIds: number[];
  @IsBoolean() published: boolean;
  @IsBoolean() featured: boolean;
}

type EventRow = Record<string, unknown> & {
  id: number;
  slug: string;
  title: string;
  category: EventCategory;
  date: string;
  location: string | null;
  guests: number | null;
  summary: string;
  description: string;
  published: number;
  featured: number;
  updated_at: Date;
};

const SELECT = `SELECT e.*, ${mediaColumns('c')} FROM events e LEFT JOIN media c ON c.id = e.cover_media_id`;

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 150);
}

@Injectable()
export class EventsService {
  constructor(private readonly db: DbService) {}

  private async gallery(eventIds: number[]): Promise<Map<number, MediaRow[]>> {
    const map = new Map<number, MediaRow[]>();
    if (eventIds.length === 0) return map;
    const rows = await this.db.all<MediaRow & { event_id: number }>(
      `SELECT em.event_id, m.* FROM event_media em JOIN media m ON m.id = em.media_id
       WHERE em.event_id IN (${eventIds.map(() => '?').join(',')}) ORDER BY em.event_id, em.sort_order`,
      eventIds,
    );
    for (const row of rows) map.set(row.event_id, [...(map.get(row.event_id) ?? []), row]);
    return map;
  }

  private toPublic(row: EventRow, gallery: MediaRow[]): EventItem {
    const cover = pickMedia(row, 'c');
    const e: EventItem = {
      id: String(row.id),
      slug: row.slug,
      title: row.title,
      category: row.category,
      date: row.date,
      summary: row.summary,
      description: row.description,
      cover: cover ? toMedia(cover) : null,
      gallery: gallery.map(toMedia),
      published: !!row.published,
      featured: !!row.featured,
    };
    if (row.location) e.location = row.location;
    if (row.guests != null) e.guests = row.guests;
    return e;
  }

  private toAdmin(row: EventRow, gallery: MediaRow[]): AdminEvent {
    const cover = pickMedia(row, 'c');
    return {
      ...this.toPublic(row, []),
      cover: cover ? toMediaRecord(cover) : null,
      gallery: gallery.map(toMediaRecord),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  async listPublic(): Promise<EventItem[]> {
    const rows = await this.db.all<EventRow>(`${SELECT} WHERE e.published = 1 ORDER BY e.date DESC, e.id DESC`);
    const gallery = await this.gallery(rows.map((r) => r.id));
    return rows.map((r) => this.toPublic(r, gallery.get(r.id) ?? []));
  }

  async getPublic(slug: string): Promise<EventItem> {
    const row = await this.db.one<EventRow>(`${SELECT} WHERE e.slug = ? AND e.published = 1`, [slug]);
    if (!row) throw new NotFoundException('Evento não encontrado.');
    const gallery = await this.gallery([row.id]);
    return this.toPublic(row, gallery.get(row.id) ?? []);
  }

  async listAdmin(): Promise<AdminEvent[]> {
    const rows = await this.db.all<EventRow>(`${SELECT} ORDER BY e.date DESC, e.id DESC`);
    const gallery = await this.gallery(rows.map((r) => r.id));
    return rows.map((r) => this.toAdmin(r, gallery.get(r.id) ?? []));
  }

  async getAdmin(id: number): Promise<AdminEvent> {
    const row = await this.db.one<EventRow>(`${SELECT} WHERE e.id = ?`, [id]);
    if (!row) throw new NotFoundException('Evento não encontrado.');
    const gallery = await this.gallery([id]);
    return this.toAdmin(row, gallery.get(id) ?? []);
  }

  /** A readable, unique address: "casamento-ana-e-lucas", then "-2", "-3"... */
  private async uniqueSlug(wanted: string, exceptId: number | null, conn: PoolConnection): Promise<string> {
    const base = slugify(wanted) || 'evento';
    for (let n = 1; n < 200; n++) {
      const candidate = n === 1 ? base : `${base}-${n}`;
      const taken = await this.db.one<{ id: number }>('SELECT id FROM events WHERE slug = ?', [candidate], conn);
      if (!taken || taken.id === exceptId) return candidate;
    }
    throw new BadRequestException('Não foi possível gerar o endereço do evento.');
  }

  private async checkMedia(ids: number[], conn: PoolConnection) {
    if (ids.length === 0) return;
    const unique = [...new Set(ids)];
    const found = await this.db.all<{ id: number }>(`SELECT id FROM media WHERE id IN (${unique.map(() => '?').join(',')})`, unique, conn);
    if (found.length !== unique.length) throw new BadRequestException('Uma das fotos não existe mais. Recarregue a página.');
  }

  private async write(id: number | null, dto: EventDto): Promise<number> {
    return this.db.transaction(async (conn) => {
      const gallery = [...new Set(dto.galleryMediaIds)];
      await this.checkMedia(dto.coverMediaId ? [dto.coverMediaId, ...gallery] : gallery, conn);
      const slug = await this.uniqueSlug(dto.slug?.trim() || dto.title, id, conn);
      const values = [
        slug,
        dto.title.trim(),
        dto.category,
        dto.date,
        dto.location?.trim() || null,
        dto.guests ?? null,
        dto.summary.trim(),
        dto.description.trim(),
        dto.coverMediaId,
        dto.published ? 1 : 0,
        dto.featured ? 1 : 0,
      ];
      let eventId = id;
      if (eventId === null) {
        const result = await this.db.run(
          `INSERT INTO events (slug, title, category, date, location, guests, summary, description, cover_media_id, published, featured)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          values,
          conn,
        );
        eventId = result.insertId;
      } else {
        await this.db.run(
          `UPDATE events SET slug = ?, title = ?, category = ?, date = ?, location = ?, guests = ?, summary = ?, description = ?,
             cover_media_id = ?, published = ?, featured = ? WHERE id = ?`,
          [...values, eventId],
          conn,
        );
        await this.db.run('DELETE FROM event_media WHERE event_id = ?', [eventId], conn);
      }
      for (const [index, mediaId] of gallery.entries()) {
        await this.db.run('INSERT INTO event_media (event_id, media_id, sort_order) VALUES (?, ?, ?)', [eventId, mediaId, index], conn);
      }
      return eventId;
    });
  }

  async create(dto: EventDto): Promise<AdminEvent> {
    return this.getAdmin(await this.write(null, dto));
  }

  async update(id: number, dto: EventDto): Promise<AdminEvent> {
    await this.getAdmin(id);
    return this.getAdmin(await this.write(id, dto));
  }

  /** Deletes the event; its photos stay in the library. */
  async delete(id: number) {
    await this.db.run('DELETE FROM events WHERE id = ?', [id]);
  }
}

@Controller()
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get('events')
  listPublic() {
    return this.events.listPublic();
  }

  @Get('events/:slug')
  getPublic(@Param('slug') slug: string) {
    return this.events.getPublic(slug);
  }

  @Get('admin/events')
  @UseGuards(AdminGuard)
  listAdmin() {
    return this.events.listAdmin();
  }

  @Get('admin/events/:id')
  @UseGuards(AdminGuard)
  getAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.events.getAdmin(id);
  }

  @Post('admin/events')
  @UseGuards(AdminGuard)
  create(@Body() dto: EventDto) {
    return this.events.create(dto);
  }

  @Put('admin/events/:id')
  @UseGuards(AdminGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: EventDto) {
    return this.events.update(id, dto);
  }

  @Delete('admin/events/:id')
  @HttpCode(204)
  @UseGuards(AdminGuard)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.events.delete(id);
  }
}
