/**
 * First load of the database: the site's current content (apps/web/src/data/static/seed) plus the
 * admin accounts in ADMIN_USERS. Only fills what is empty, so it never overwrites Cris's edits.
 *   npm run db:seed -w apps/api
 */
import type { Media } from '@harmonize/shared';
import { randomBytes } from 'crypto';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { BANNERS } from '../../web/src/data/static/seed/banners';
import { EVENTS } from '../../web/src/data/static/seed/events';
import { PAGES } from '../../web/src/data/static/seed/pages';
import { SETTINGS } from '../../web/src/data/static/seed/settings';
import { hashPassword } from '../src/auth/passwords';
import { finish, pool } from './db';

const count = async (table: string) => {
  const [rows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS n FROM ${table}`);
  return Number(rows[0].n);
};

const mediaIds = new Map<string, number>();

/** Seed photos are external URLs (demo photos, /img/...): registered in the library without files. */
async function mediaId(media: Media): Promise<number> {
  const known = mediaIds.get(media.url);
  if (known) return known;
  const [result] = await pool.query<ResultSetHeader>('INSERT INTO media (url, alt, focus) VALUES (?, ?, ?)', [
    media.url,
    media.alt,
    media.focus ?? null,
  ]);
  mediaIds.set(media.url, result.insertId);
  return result.insertId;
}

async function seedContent() {
  if ((await count('settings')) === 0) {
    await pool.query('INSERT INTO settings (id, data) VALUES (1, ?)', [JSON.stringify(SETTINGS)]);
    console.log('✓ configurações');
  }

  for (const [slug, content] of Object.entries(PAGES)) {
    const [result] = await pool.query<ResultSetHeader>('INSERT IGNORE INTO pages (slug, content) VALUES (?, ?)', [slug, JSON.stringify(content)]);
    if (result.affectedRows) console.log(`✓ página ${slug}`);
  }

  if ((await count('banners')) === 0) {
    for (const b of BANNERS) {
      await pool.query(
        'INSERT INTO banners (media_id, eyebrow, title, subtitle, cta_label, cta_href, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [await mediaId(b.image), b.eyebrow ?? null, b.title, b.subtitle ?? null, b.cta?.label ?? null, b.cta?.href ?? null, b.active ? 1 : 0, b.order],
      );
    }
    console.log(`✓ ${BANNERS.length} banners`);
  }

  if ((await count('events')) === 0) {
    for (const e of EVENTS) {
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO events (slug, title, category, date, location, guests, summary, description, cover_media_id, published, featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [e.slug, e.title, e.category, e.date, e.location ?? null, e.guests ?? null, e.summary, e.description, e.cover ? await mediaId(e.cover) : null, e.published ? 1 : 0, e.featured ? 1 : 0],
      );
      for (const [index, photo] of e.gallery.entries()) {
        await pool.query('INSERT IGNORE INTO event_media (event_id, media_id, sort_order) VALUES (?, ?, ?)', [result.insertId, await mediaId(photo), index]);
      }
    }
    console.log(`✓ ${EVENTS.length} eventos`);
  }
}

async function seedUsers() {
  const entries = (process.env.ADMIN_USERS ?? '')
    .split(',')
    .map((s) => s.split('|').map((p) => p.trim()))
    .filter(([name, email]) => name && email);

  for (const [name, rawEmail] of entries) {
    const email = rawEmail.toLowerCase();
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length > 0) continue;
    // Readable but strong: 4 groups of random characters. Shown once, then only the hash exists.
    const password = randomBytes(12).toString('base64url').match(/.{1,4}/g)!.join('-');
    await pool.query('INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)', [email, name, await hashPassword(password)]);
    console.log(`✓ conta criada: ${name} <${email}>  senha: ${password}`);
  }
}

async function main() {
  await seedContent();
  await seedUsers();
  console.log('Pronto. Anote as senhas exibidas acima; elas não aparecem de novo.');
}

main().then(
  () => finish(),
  (err) => {
    console.error(err);
    return finish(1);
  },
);
