import type { Media } from './media'

export type EventCategory = 'casamento' | 'quinze-anos' | 'aniversario' | 'bodas' | 'cha' | 'corporativo' | 'outro'

/** An event Cris produced, published in the portfolio. Created and edited in the panel (v2). */
export type EventItem = {
  id: string
  slug: string
  title: string
  category: EventCategory
  /** ISO date, yyyy-mm-dd. */
  date: string
  location?: string
  guests?: number
  summary: string
  /** Paragraphs separated by a blank line. */
  description: string
  cover: Media | null
  gallery: Media[]
  published: boolean
  featured: boolean
}
