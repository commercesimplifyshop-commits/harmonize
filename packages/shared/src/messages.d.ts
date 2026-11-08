import type { EventCategory } from './events'

/** Sent by the contact form. v2: the api e-mails it and keeps it in the panel's inbox. */
export type ContactMessage = {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  /** Honeypot: real visitors leave it empty. */
  website?: string
  /** v2: reCAPTCHA token, checked by the api. */
  captchaToken?: string
}

/** Filled on the quote page and turned into a WhatsApp message. v2 also stores it as a lead. */
export type QuoteRequest = {
  name: string
  category: EventCategory
  date?: string
  city?: string
  guests?: string
  services: string[]
  message?: string
}
