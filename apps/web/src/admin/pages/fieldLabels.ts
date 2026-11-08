import type { IconName } from '@harmonize/shared'

/** Friendly names for the keys of PagesContent. Unknown keys fall back to the key itself. */
export const LABELS: Record<string, string> = {
  hero: 'Topo da página',
  intro: 'Apresentação',
  services: 'Serviços',
  about: 'Bloco “Quem faz a Harmonize”',
  events: 'Bloco de eventos',
  steps: 'Como funciona',
  testimonial: 'Depoimento',
  cta: 'Chamada final',
  portrait: 'Foto da Cris',
  bio: 'Biografia',
  harmonize: 'A Harmonize',
  values: 'Valores',
  eyebrow: 'Texto pequeno acima do título',
  title: 'Título',
  text: 'Texto',
  subtitle: 'Subtítulo',
  items: 'Itens',
  icon: 'Ícone',
  image: 'Foto',
  paragraphs: 'Parágrafos',
  signature: 'Assinatura',
  buttonLabel: 'Texto do botão',
  quote: 'Depoimento',
  author: 'Nome de quem falou',
  event: 'Evento',
  empty: 'Texto quando não há eventos no filtro',
  formTitle: 'Título do formulário',
  note: 'Observação ao lado do formulário',
  greeting: 'Primeira linha da mensagem no WhatsApp',
  successMessage: 'Mensagem depois de enviar',
}

export const ITEM_LABELS: Record<string, string> = {
  items: 'Item',
  paragraphs: 'Parágrafo',
}

/** Keys whose text is long enough for a multi-line box. */
export const LONG_TEXT = new Set(['text', 'quote', 'paragraphs', 'subtitle', 'note', 'greeting', 'successMessage', 'empty'])

/** Keys that hold an image (may be null, then the site shows the placeholder). */
export const MEDIA_KEYS = new Set(['image', 'portrait'])

/** Optional blocks that can be switched off, with what they start with when switched back on. */
export const OPTIONAL_BLOCKS: Record<string, unknown> = {
  testimonial: { quote: '', author: '', event: '' },
}

export const ICONS: { value: IconName; label: string }[] = [
  { value: 'rings', label: 'Alianças' },
  { value: 'flower', label: 'Flor' },
  { value: 'sparkle', label: 'Brilho' },
  { value: 'clipboard', label: 'Prancheta' },
  { value: 'calendar', label: 'Calendário' },
  { value: 'cake', label: 'Bolo' },
  { value: 'glass', label: 'Taça' },
  { value: 'heart', label: 'Coração' },
  { value: 'star', label: 'Estrela' },
  { value: 'chat', label: 'Conversa' },
]

export const PAGE_PATHS: Record<string, string> = {
  home: '/',
  sobre: '/sobre',
  eventos: '/eventos',
  orcamento: '/orcamento',
  contato: '/contato',
}
