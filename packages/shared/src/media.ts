/**
 * An image as the site stores it. `url` is absolute (CDN, demo photos) or a path served by
 * the api (`/uploads/...`, v2). The layout never depends on the image: a null Media renders
 * a placeholder in the brand colors.
 */
export type Media = {
  url: string
  alt: string
  /** Focal point for object-position, e.g. "50% 30%". Lets the admin keep faces in frame. */
  focus?: string
}
