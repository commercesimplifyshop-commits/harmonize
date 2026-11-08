import type { Media } from './media'

/** Business data shown on every page (top bar, footer, WhatsApp links). Editable in the panel. */
export type SiteSettings = {
  brandName: string
  brandSuffix: string
  tagline: string
  ownerName: string
  /** Digits only, with country and area code: 5575991979918. */
  whatsapp: string
  phoneDisplay: string
  email: string
  instagram: string
  city: string
  serviceArea: string
}

/** One slide of the home carousel. The admin picks the image and the text, and orders them. */
export type Banner = {
  id: string
  image: Media
  eyebrow?: string
  title: string
  subtitle?: string
  cta?: { label: string; href: string }
  active: boolean
  order: number
}
