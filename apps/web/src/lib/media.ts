import type { Media } from '@harmonize/shared'

/** Demo photos come from the Unsplash CDN (free license). Every id used was checked by eye. */
export const unsplash = (id: string, alt: string, focus?: string): Media => ({
  url: `https://images.unsplash.com/photo-${id}`,
  alt,
  focus,
})

/** Asks the CDN for the width the slot needs. Uploaded files (v2) are returned as they are. */
export function sized(url: string, width: number): string {
  if (!url.startsWith('https://images.unsplash.com/')) return url
  return `${url}?w=${width}&q=72&auto=format&fit=crop`
}
