import type { EventCategory, EventItem } from './events'
import type { Media } from './media'
import type { PageSlug } from './pages'
import type { Banner } from './site'

/** Shapes used only between the admin panel and the api. */

export type AuthUser = { id: number; name: string; email: string }

export type LoginRequest = { email: string; password: string; captchaToken?: string }

export type ChangePasswordRequest = { currentPassword: string; newPassword: string }

/** A file in the media library. Pages, banners and events point at these. */
export type MediaRecord = Media & {
  id: number
  width: number | null
  height: number | null
  size: number | null
  createdAt: string
}

export type AdminEvent = Omit<EventItem, 'cover' | 'gallery'> & {
  cover: MediaRecord | null
  gallery: MediaRecord[]
  updatedAt: string
}

export type EventInput = {
  title: string
  /** Generated from the title when empty. */
  slug?: string
  category: EventCategory
  date: string
  location?: string | null
  guests?: number | null
  summary: string
  description: string
  coverMediaId: number | null
  galleryMediaIds: number[]
  published: boolean
  featured: boolean
}

export type AdminBanner = Omit<Banner, 'id' | 'image'> & { id: number; image: MediaRecord }

export type BannerInput = {
  mediaId: number
  eyebrow?: string | null
  title: string
  subtitle?: string | null
  ctaLabel?: string | null
  ctaHref?: string | null
  active: boolean
}

export type PageSummary = { slug: PageSlug; title: string; updatedAt: string | null }

export type MessageType = 'contato' | 'orcamento'

export type MessageRecord = {
  id: number
  type: MessageType
  name: string
  email: string | null
  phone: string | null
  subject: string | null
  body: string
  readAt: string | null
  createdAt: string
}

export type AdminSummary = {
  events: { total: number; published: number; drafts: number }
  upcoming: Pick<EventItem, 'id' | 'slug' | 'title' | 'date' | 'category'>[]
  unreadMessages: number
  media: number
}
