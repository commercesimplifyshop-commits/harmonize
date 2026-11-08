import type { Media } from './media'

/**
 * Content of the static pages. Every string and image here is editable in the admin panel (v2):
 * the panel lists the pages, opens one and edits these fields. Layout and styling stay in code.
 */

export type IconName = 'rings' | 'sparkle' | 'clipboard' | 'flower' | 'cake' | 'glass' | 'heart' | 'calendar' | 'chat' | 'star'

export type Feature = { icon: IconName; title: string; text: string }
export type Step = { title: string; text: string }

export type HomePage = {
  intro: { eyebrow: string; title: string; text: string }
  services: { title: string; items: Feature[] }
  about: { eyebrow: string; title: string; text: string; image: Media | null; buttonLabel: string }
  events: { title: string; text: string }
  steps: { title: string; items: Step[] }
  testimonial: { quote: string; author: string; event: string } | null
  cta: { title: string; text: string; buttonLabel: string }
}

export type AboutPage = {
  hero: { eyebrow: string; title: string; text: string }
  portrait: Media | null
  bio: { title: string; paragraphs: string[]; signature: string }
  harmonize: { title: string; paragraphs: string[]; image: Media | null }
  values: { title: string; items: Feature[] }
  cta: { title: string; text: string; buttonLabel: string }
}

export type EventsPage = {
  hero: { eyebrow: string; title: string; text: string }
  empty: string
}

export type QuotePage = {
  hero: { eyebrow: string; title: string; text: string }
  formTitle: string
  note: string
  /** Opening line of the WhatsApp message built from the form. */
  greeting: string
}

export type ContactPage = {
  hero: { eyebrow: string; title: string; text: string }
  formTitle: string
  successMessage: string
}

export type PagesContent = {
  home: HomePage
  sobre: AboutPage
  eventos: EventsPage
  orcamento: QuotePage
  contato: ContactPage
}

export type PageSlug = keyof PagesContent
