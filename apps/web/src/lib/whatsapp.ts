import type { QuoteRequest } from '@harmonize/shared'
import { CATEGORY_LABEL, formatDate } from './format'

export const whatsappLink = (phone: string, text: string) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`

/** Turns the quote form into a readable WhatsApp message (WhatsApp renders *bold*). */
export function quoteMessage(greeting: string, q: QuoteRequest): string {
  const fields = [
    `*Nome:* ${q.name}`,
    `*Tipo de evento:* ${CATEGORY_LABEL[q.category]}`,
    q.date && `*Data:* ${formatDate(q.date)}`,
    q.city && `*Cidade/local:* ${q.city}`,
    q.guests && `*Convidados:* ${q.guests}`,
    q.services.length > 0 && `*Preciso de:* ${q.services.join(', ')}`,
  ].filter(Boolean)
  return [greeting, fields.join('\n'), q.message?.trim()].filter(Boolean).join('\n\n')
}
