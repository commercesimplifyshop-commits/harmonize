import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { MediaRecord } from '@harmonize/shared';
import { randomUUID } from 'crypto';
import sharp, { type Metadata } from 'sharp';
import { DbService } from '../db/db.service';
import { toMediaRecord, type MediaRow } from './media.mapper';
import { storage } from './storage';

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel functions accept ~4.5 MB bodies.
const FULL_WIDTH = 1920;
const THUMB_WIDTH = 640;
const ACCEPTED_FORMATS = new Set(['jpeg', 'png', 'webp', 'heif', 'avif', 'gif']);

@Injectable()
export class MediaService {
  constructor(private readonly db: DbService) {}

  async list(limit: number, before?: number): Promise<MediaRecord[]> {
    const rows = await this.db.all<MediaRow>(
      `SELECT * FROM media ${before ? 'WHERE id < ?' : ''} ORDER BY id DESC LIMIT ?`,
      before ? [before, limit] : [limit],
    );
    return rows.map(toMediaRecord);
  }

  async get(id: number): Promise<MediaRecord> {
    const row = await this.db.one<MediaRow>('SELECT * FROM media WHERE id = ?', [id]);
    if (!row) throw new NotFoundException('Foto não encontrada.');
    return toMediaRecord(row);
  }

  /**
   * Re-encodes every upload: checks the real format (not the extension), applies the phone's
   * rotation, strips EXIF/GPS (sharp drops metadata by default) and stores two WebP sizes.
   */
  async upload(file: Express.Multer.File | undefined, alt: string, userId: number): Promise<MediaRecord> {
    if (!file) throw new BadRequestException('Envie uma imagem.');
    if (file.size > MAX_UPLOAD_BYTES) throw new BadRequestException('A imagem passou de 4 MB.');

    let meta: Metadata;
    try {
      meta = await sharp(file.buffer).metadata();
    } catch {
      throw new BadRequestException('Esse arquivo não é uma imagem válida.');
    }
    if (!meta.format || !ACCEPTED_FORMATS.has(meta.format)) {
      // The panel converts iPhone HEIC photos to JPEG in the browser before sending.
      throw new BadRequestException('Formato não aceito. Use JPG, PNG ou WebP.');
    }

    const base = sharp(file.buffer, { failOn: 'error' }).rotate();
    const full = await base.clone().resize({ width: FULL_WIDTH, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    const thumb = await base.clone().resize({ width: THUMB_WIDTH, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();

    const month = new Date().toISOString().slice(0, 7);
    const id = randomUUID();
    const fullStored = await storage.put(`media/${month}/${id}.webp`, full.data, 'image/webp');
    const thumbStored = await storage.put(`media/${month}/${id}-thumb.webp`, thumb, 'image/webp');

    const result = await this.db.run(
      `INSERT INTO media (url, thumb_url, storage_key, thumb_key, alt, width, height, size, mime, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'image/webp', ?)`,
      [fullStored.url, thumbStored.url, fullStored.key, thumbStored.key, alt.slice(0, 300), full.info.width, full.info.height, full.data.length, userId],
    );
    return this.get(result.insertId);
  }

  async update(id: number, alt: string | undefined, focus: string | null | undefined): Promise<MediaRecord> {
    await this.get(id);
    if (alt !== undefined) await this.db.run('UPDATE media SET alt = ? WHERE id = ?', [alt.slice(0, 300), id]);
    if (focus !== undefined) await this.db.run('UPDATE media SET focus = ? WHERE id = ?', [focus, id]);
    return this.get(id);
  }

  /** Lists where a photo is used, so it can't be deleted out from under a page. */
  async usage(id: number): Promise<string[]> {
    const row = await this.db.one<MediaRow>('SELECT * FROM media WHERE id = ?', [id]);
    if (!row) throw new NotFoundException('Foto não encontrada.');
    const uses: string[] = [];
    const banners = await this.db.all<{ title: string }>('SELECT title FROM banners WHERE media_id = ?', [id]);
    banners.forEach((b) => uses.push(`Banner "${b.title}"`));
    const events = await this.db.all<{ title: string }>(
      `SELECT DISTINCT e.title FROM events e LEFT JOIN event_media em ON em.event_id = e.id
       WHERE e.cover_media_id = ? OR em.media_id = ?`,
      [id, id],
    );
    events.forEach((e) => uses.push(`Evento "${e.title}"`));
    // Pages embed the image itself (url) in their JSON.
    const pages = await this.db.all<{ slug: string }>('SELECT slug FROM pages WHERE INSTR(CAST(content AS CHAR), ?) > 0', [row.url]);
    pages.forEach((p) => uses.push(`Página "${p.slug}"`));
    return uses;
  }

  async delete(id: number) {
    const uses = await this.usage(id);
    if (uses.length > 0) throw new ConflictException(`Essa foto está em uso: ${uses.join(', ')}. Troque-a antes de apagar.`);
    const row = await this.db.one<MediaRow>('SELECT * FROM media WHERE id = ?', [id]);
    await this.db.run('DELETE FROM media WHERE id = ?', [id]);
    if (row?.storage_key) await storage.delete(row.storage_key);
    if (row?.thumb_key) await storage.delete(row.thumb_key);
  }
}
