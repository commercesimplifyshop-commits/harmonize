import type { Media, MediaRecord } from '@harmonize/shared';

export type MediaRow = {
  id: number;
  url: string;
  thumb_url: string | null;
  storage_key: string | null;
  thumb_key: string | null;
  alt: string;
  focus: string | null;
  width: number | null;
  height: number | null;
  size: number | null;
  created_at: Date;
};

export function toMediaRecord(row: MediaRow): MediaRecord {
  return {
    id: row.id,
    url: row.url,
    thumbUrl: row.thumb_url ?? undefined,
    alt: row.alt,
    focus: row.focus ?? undefined,
    width: row.width,
    height: row.height,
    size: row.size,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

/** Public shape: no ids or file details. */
export function toMedia(row: Pick<MediaRow, 'url' | 'thumb_url' | 'alt' | 'focus'>): Media {
  const media: Media = { url: row.url, alt: row.alt };
  if (row.thumb_url) media.thumbUrl = row.thumb_url;
  if (row.focus) media.focus = row.focus;
  return media;
}

/** Columns to select when joining media with an alias prefix, e.g. mediaColumns('c') -> c.url AS c_url... */
export const mediaColumns = (alias: string) =>
  ['id', 'url', 'thumb_url', 'alt', 'focus', 'width', 'height', 'size', 'created_at'].map((c) => `${alias}.${c} AS ${alias}_${c}`).join(', ');

/** Reads back the columns produced by mediaColumns(); null when the join found nothing. */
export function pickMedia(row: Record<string, unknown>, alias: string): MediaRow | null {
  if (row[`${alias}_id`] == null) return null;
  const get = (c: string) => row[`${alias}_${c}`];
  return {
    id: get('id') as number,
    url: get('url') as string,
    thumb_url: get('thumb_url') as string | null,
    storage_key: null,
    thumb_key: null,
    alt: get('alt') as string,
    focus: get('focus') as string | null,
    width: get('width') as number | null,
    height: get('height') as number | null,
    size: get('size') as number | null,
    created_at: get('created_at') as Date,
  };
}
