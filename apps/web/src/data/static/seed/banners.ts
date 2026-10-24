import type { Banner } from '@harmonize/shared'
import { unsplash } from '../../../lib/media'

export const BANNERS: Banner[] = [
  {
    id: 'b1',
    image: unsplash('1469371670807-013ccf25f16a', 'Cerimônia ao ar livre com corredor de flores', '50% 60%'),
    eyebrow: 'Assessoria e decoração',
    title: 'O seu dia, em perfeita harmonia',
    subtitle: 'Cuidamos de cada detalhe para você viver o evento, e não se preocupar com ele.',
    cta: { label: 'Pedir orçamento', href: '/orcamento' },
    active: true,
    order: 1,
  },
  {
    id: 'b2',
    image: unsplash('1511795409834-ef04bbd61622', 'Mesa posta com flores e taças', '50% 50%'),
    eyebrow: 'Decoração',
    title: 'Mesas que recebem bem',
    subtitle: 'Flores, louças e luz pensadas para o estilo de cada família.',
    cta: { label: 'Ver eventos', href: '/eventos' },
    active: true,
    order: 2,
  },
  {
    id: 'b3',
    image: unsplash('1519167758481-83f550bb49b3', 'Salão de festas com mesas redondas decoradas', '50% 55%'),
    eyebrow: '15 anos, bodas e aniversários',
    title: 'Celebrações com o requinte que você merece',
    subtitle: 'Do primeiro rascunho ao último convidado, a Harmonize está com você.',
    cta: { label: 'Conheça a Cris', href: '/sobre' },
    active: true,
    order: 3,
  },
]
