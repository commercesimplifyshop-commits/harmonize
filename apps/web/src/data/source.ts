import type { Banner, ContactMessage, EventItem, PagesContent, PageSlug, SiteSettings } from '@harmonize/shared'

/**
 * Everything the public site reads or sends. Pages only talk to this interface, so switching
 * from the static demo content (v1) to the NestJS api (v2) changes no component.
 */
export interface DataSource {
  getSettings(): Promise<SiteSettings>
  getBanners(): Promise<Banner[]>
  getPage<S extends PageSlug>(slug: S): Promise<PagesContent[S]>
  /** Published events, newest first. */
  listEvents(): Promise<EventItem[]>
  getEvent(slug: string): Promise<EventItem | null>
  sendContact(message: ContactMessage): Promise<void>
}
