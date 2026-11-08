import type { EventCategory } from './events'
import type { Media } from './media'

/**
 * v2+: what Cris records on her phone while visiting a client or a venue. Drafts are saved
 * as she types and can later become an EventItem. Not used by the public site.
 */
export type VisitStatus = 'rascunho' | 'proposta-enviada' | 'fechado' | 'perdido'

export type Visit = {
  id: string
  clientName: string
  clientPhone?: string
  category: EventCategory
  eventDate?: string
  visitedAt: string
  place?: string
  notes: string
  photos: Media[]
  status: VisitStatus
  /** Set when the visit turns into a published event. */
  eventId?: string
}
