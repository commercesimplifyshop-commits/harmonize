/**
 * An image as the site stores it. `url` is absolute (uploads on Blob storage, demo photos on a
 * CDN) or a path served by the api (`/uploads/...`). The layout never depends on the image: a
 * null Media renders a placeholder in the brand colors.
 */
export type Media = {
  url: string
  alt: string
  /** Smaller copy (about 640px) for cards and thumbnails. Uploads always have one. */
  thumbUrl?: string
  /** Focal point for object-position, e.g. "50% 30%". Lets the admin keep faces in frame. */
  focus?: string
}
