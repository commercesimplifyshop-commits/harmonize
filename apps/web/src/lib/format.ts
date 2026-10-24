import type { EventCategory } from '@harmonize/shared'

export const CATEGORY_LABEL: Record<EventCategory, string> = {
  casamento: 'Casamento',
  'quinze-anos': '15 anos',
  aniversario: 'Aniversário',
  bodas: 'Bodas',
  cha: 'Chá',
  corporativo: 'Corporativo',
  outro: 'Outro',
}

// Dates are yyyy-mm-dd without time: parse as local noon so the day never shifts with the timezone.
const toDate = (iso: string) => new Date(`${iso}T12:00:00`)

export const formatDate = (iso: string) =>
  toDate(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

export const formatMonthYear = (iso: string) =>
  toDate(iso).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

export const paragraphs = (text: string) => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
