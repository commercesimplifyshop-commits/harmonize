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
import type { AdminBanner, Banner, BannerInput } from '@harmonize/shared';
import { ArrayMaxSize, IsArray, IsBoolean, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { AdminGuard } from '../auth/auth.guard';
import { DbService } from '../db/db.service';
import { mediaColumns, pickMedia, toMedia, toMediaRecord } from '../media/media.mapper';
import { isSafeHref } from './validate';

export class BannerDto implements BannerInput {
  @IsInt() mediaId: number;
  @IsOptional() @IsString() @MaxLength(120) eyebrow?: string | null;
  @IsString() @MinLength(1, { message: 'O banner precisa de um título.' }) @MaxLength(200) title: string;
  @IsOptional() @IsString() @MaxLength(400) subtitle?: string | null;
  @IsOptional() @IsString() @MaxLength(60) ctaLabel?: string | null;
  @IsOptional() @IsString() @MaxLength(300) ctaHref?: string | null;
  @IsBoolean() active: boolean;
}

class OrderDto {
  @IsArray() @ArrayMaxSize(50) @IsInt({ each: true }) ids: number[];
}

type BannerRow = Record<string, unknown> & {
  id: number;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  cta_label: string | null;
  cta_href: string | null;
  active: number;
  sort_order: number;
};

const SELECT = `SELECT b.*, ${mediaColumns('m')} FROM banners b JOIN media m ON m.id = b.media_id`;

function toAdmin(row: BannerRow): AdminBanner {
  return {
    id: row.id,
    image: toMediaRecord(pickMedia(row, 'm')!),
    eyebrow: row.eyebrow ?? undefined,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    cta: row.cta_label && row.cta_href ? { label: row.cta_label, href: row.cta_href } : undefined,
    active: !!row.active,
    order: row.sort_order,
  };
}

function toPublic(row: BannerRow): Banner {
  const b: Banner = { id: String(row.id), image: toMedia(pickMedia(row, 'm')!), title: row.title, active: true, order: row.sort_order };
  if (row.eyebrow) b.eyebrow = row.eyebrow;
  if (row.subtitle) b.subtitle = row.subtitle;
  if (row.cta_label && row.cta_href) b.cta = { label: row.cta_label, href: row.cta_href };
  return b;
}

@Injectable()
export class BannersService {
  constructor(private readonly db: DbService) {}

  async listPublic(): Promise<Banner[]> {
    const rows = await this.db.all<BannerRow>(`${SELECT} WHERE b.active = 1 ORDER BY b.sort_order, b.id`);
    return rows.map(toPublic);
  }

  async listAdmin(): Promise<AdminBanner[]> {
    const rows = await this.db.all<BannerRow>(`${SELECT} ORDER BY b.sort_order, b.id`);
    return rows.map(toAdmin);
  }

  async get(id: number): Promise<AdminBanner> {
    const row = await this.db.one<BannerRow>(`${SELECT} WHERE b.id = ?`, [id]);
    if (!row) throw new NotFoundException('Banner não encontrado.');
    return toAdmin(row);
  }

  private values(dto: BannerDto) {
    const label = dto.ctaLabel?.trim() || null;
    const href = dto.ctaHref?.trim() || null;
    if (href && !isSafeHref(href)) throw new BadRequestException('Link do botão inválido. Use um endereço do site (ex.: /orcamento) ou https://.');
    return [dto.mediaId, dto.eyebrow?.trim() || null, dto.title.trim(), dto.subtitle?.trim() || null, label, href, dto.active ? 1 : 0];
  }

  async create(dto: BannerDto): Promise<AdminBanner> {
    const next = await this.db.one<{ n: number | null }>('SELECT MAX(sort_order) AS n FROM banners');
    const result = await this.db.run(
      `INSERT INTO banners (media_id, eyebrow, title, subtitle, cta_label, cta_href, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [...this.values(dto), (next?.n ?? 0) + 1],
    );
    return this.get(result.insertId);
  }

  async update(id: number, dto: BannerDto): Promise<AdminBanner> {
    await this.get(id);
    await this.db.run(
      `UPDATE banners SET media_id = ?, eyebrow = ?, title = ?, subtitle = ?, cta_label = ?, cta_href = ?, active = ? WHERE id = ?`,
      [...this.values(dto), id],
    );
    return this.get(id);
  }

  async delete(id: number) {
    await this.db.run('DELETE FROM banners WHERE id = ?', [id]);
  }

  async reorder(ids: number[]): Promise<AdminBanner[]> {
    await this.db.transaction(async (conn) => {
      for (const [index, id] of ids.entries()) await this.db.run('UPDATE banners SET sort_order = ? WHERE id = ?', [index + 1, id], conn);
    });
    return this.listAdmin();
  }
}

@Controller()
export class BannersController {
  constructor(private readonly banners: BannersService) {}

  @Get('banners')
  listPublic() {
    return this.banners.listPublic();
  }

  @Get('admin/banners')
  @UseGuards(AdminGuard)
  listAdmin() {
    return this.banners.listAdmin();
  }

  @Post('admin/banners')
  @UseGuards(AdminGuard)
  create(@Body() dto: BannerDto) {
    return this.banners.create(dto);
  }

  @Put('admin/banners/order')
  @UseGuards(AdminGuard)
  reorder(@Body() dto: OrderDto) {
    return this.banners.reorder(dto.ids);
  }

  @Put('admin/banners/:id')
  @UseGuards(AdminGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: BannerDto) {
    return this.banners.update(id, dto);
  }

  @Delete('admin/banners/:id')
  @HttpCode(204)
  @UseGuards(AdminGuard)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.banners.delete(id);
  }
}
