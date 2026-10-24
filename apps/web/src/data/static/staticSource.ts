import type { DataSource } from '../source'
import { BANNERS } from './seed/banners'
import { EVENTS } from './seed/events'
import { PAGES } from './seed/pages'
import { SETTINGS } from './seed/settings'

/** v1: demo content bundled with the site. The seed files are also the api's initial data in v2. */
export const staticSource: DataSource = {
  getSettings: async () => SETTINGS,
  getBanners: async () => BANNERS.filter((b) => b.active).sort((a, b) => a.order - b.order),
  getPage: async (slug) => PAGES[slug],
  listEvents: async () => EVENTS.filter((e) => e.published).sort((a, b) => b.date.localeCompare(a.date)),
  getEvent: async (slug) => EVENTS.find((e) => e.slug === slug && e.published) ?? null,
  // No backend yet: the form behaves as if the message was sent.
  sendContact: () => new Promise((resolve) => setTimeout(resolve, 700)),
}
