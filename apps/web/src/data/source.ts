import type { Banner, ContactMessage, EventItem, PagesContent, PageSlug, QuoteRequest, SiteSettings } from '@harmonize/shared'

/**
 * Everything the public site reads or sends. Pages only talk to this interface, so the bundled
 * demo content and the NestJS api are interchangeable (VITE_DATA_SOURCE).
 */
export interface DataSource {
  getSettings(): Promise<SiteSettings>
  getBanners(): Promise<Banner[]>
  getPage<S extends PageSlug>(slug: S): Promise<PagesContent[S]>
  /** Published events, newest first. */
  listEvents(): Promise<EventItem[]>
  getEvent(slug: string): Promise<EventItem | null>
  sendContact(message: ContactMessage): Promise<void>
  /** Keeps a copy of a quote request in the panel (the request itself goes to WhatsApp). */
  sendQuote(quote: QuoteRequest): Promise<void>
}
