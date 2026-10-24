import type { Media, PagesContent } from '@harmonize/shared'
import { unsplash } from '../../../lib/media'

// Provisional copy: Cris rewrites any of it in the panel (v2).
const PORTRAIT: Media = { url: '/img/cris-reboucas.jpg', alt: 'Cris Rebouças, sorrindo', focus: '50% 28%' }

export const PAGES: PagesContent = {
  home: {
    intro: {
      eyebrow: 'Harmonize Eventos',
      title: 'Assessoria e decoração para quem quer viver o próprio evento',
      text: 'Casamentos, 15 anos, aniversários, bodas e confraternizações. A Harmonize planeja, decora e coordena para que tudo aconteça no tempo certo, do jeito que você sonhou.',
    },
    services: {
      title: 'Como podemos ajudar',
      items: [
        { icon: 'clipboard', title: 'Assessoria completa', text: 'Planejamento, cronograma, orçamento e indicação de fornecedores de confiança, do primeiro encontro ao grande dia.' },
        { icon: 'flower', title: 'Decoração', text: 'Projeto de decoração sob medida: flores, mesas, iluminação e cenografia no estilo de cada evento.' },
        { icon: 'calendar', title: 'Coordenação do dia', text: 'Equipe no local para receber fornecedores, conduzir o roteiro e resolver imprevistos sem que ninguém perceba.' },
        { icon: 'sparkle', title: 'Eventos sociais e corporativos', text: 'Aniversários, chás, bodas, confraternizações e lançamentos, com a mesma atenção aos detalhes.' },
      ],
    },
    about: {
      eyebrow: 'Quem faz a Harmonize',
      title: 'Cris Rebouças',
      text: 'À frente da Harmonize, Cris acompanha cada cliente de perto: visita o espaço, ouve a história da família e transforma tudo isso em um evento acolhedor, organizado e elegante.',
      image: PORTRAIT,
      buttonLabel: 'Conheça a nossa história',
    },
    events: {
      title: 'Eventos realizados',
      text: 'Alguns dos momentos que tivemos o prazer de assinar.',
    },
    steps: {
      title: 'Do primeiro contato ao grande dia',
      items: [
        { title: 'Conversa', text: 'Você conta o que imagina pelo WhatsApp ou pelo formulário de orçamento.' },
        { title: 'Visita e proposta', text: 'Visitamos o espaço, entendemos o estilo e enviamos uma proposta clara.' },
        { title: 'Planejamento', text: 'Cronograma, fornecedores e projeto de decoração aprovados com você.' },
        { title: 'O grande dia', text: 'Montagem, coordenação e cuidado do início ao fim. Você só aproveita.' },
      ],
    },
    testimonial: {
      quote: 'Depoimento de cliente. Pelo painel, a Cris troca este texto por um comentário real de quem já fez um evento com a Harmonize.',
      author: 'Nome do cliente',
      event: 'Casamento',
    },
    cta: {
      title: 'Vamos planejar o seu evento?',
      text: 'Conte a data, o tipo de evento e o número de convidados. A Cris responde pelo WhatsApp.',
      buttonLabel: 'Pedir orçamento',
    },
  },

  sobre: {
    hero: {
      eyebrow: 'Sobre',
      title: 'Requinte, cuidado e muita organização',
      text: 'Conheça a Cris Rebouças e a forma como a Harmonize trabalha.',
    },
    portrait: PORTRAIT,
    bio: {
      title: 'Prazer, eu sou a Cris',
      paragraphs: [
        'Sou organizadora de eventos e fundei a Harmonize para fazer o que mais gosto: transformar a ideia de cada família em um dia bonito, tranquilo e inesquecível.',
        'Gosto de conhecer as pessoas antes de conhecer o evento. Por isso vou até você, visito o espaço, anoto cada detalhe e acompanho tudo de perto, do primeiro rascunho à última mesa desmontada.',
        'Este texto é provisório. Pelo painel, posso contar aqui a minha trajetória, os eventos que marcaram e o que me move.',
      ],
      signature: 'Cris Rebouças',
    },
    harmonize: {
      title: 'A Harmonize',
      paragraphs: [
        'O nome diz o que buscamos em cada trabalho: harmonia entre o sonho do cliente, o orçamento, o espaço e as pessoas envolvidas.',
        'Oferecemos assessoria e decoração para casamentos, 15 anos, aniversários, bodas, chás e eventos corporativos, sempre com o requinte que você merece.',
      ],
      image: unsplash('1519225421980-715cb0215aed', 'Mesa comprida decorada com flores brancas', '50% 50%'),
    },
    values: {
      title: 'No que acreditamos',
      items: [
        { icon: 'heart', title: 'Atenção a cada pessoa', text: 'Cada família tem uma história. O evento precisa ter a cara dela.' },
        { icon: 'clipboard', title: 'Organização', text: 'Cronograma, contratos e fornecedores em dia, para não haver surpresas.' },
        { icon: 'star', title: 'Requinte nos detalhes', text: 'Do arranjo da mesa ao horário da entrada, nada fica por acaso.' },
      ],
    },
    cta: {
      title: 'Vamos conversar sobre o seu evento?',
      text: 'Conte o que você imagina. A gente cuida do resto.',
      buttonLabel: 'Pedir orçamento',
    },
  },

  eventos: {
    hero: {
      eyebrow: 'Portfólio',
      title: 'Eventos realizados',
      text: 'Casamentos, aniversários e celebrações assinadas pela Harmonize.',
    },
    empty: 'Nenhum evento nesta categoria ainda.',
  },

  orcamento: {
    hero: {
      eyebrow: 'Orçamento',
      title: 'Peça seu orçamento',
      text: 'Preencha o que já souber. A mensagem abre pronta no WhatsApp da Cris, é só enviar.',
    },
    formTitle: 'Conte sobre o seu evento',
    note: 'Ainda não tem todas as informações? Sem problema, envie o que tiver e conversamos.',
    greeting: 'Olá, Cris! Vim pelo site da Harmonize e gostaria de um orçamento.',
  },

  contato: {
    hero: {
      eyebrow: 'Contato',
      title: 'Fale com a Harmonize',
      text: 'Mande sua mensagem por e-mail ou chame no WhatsApp. Respondemos o mais rápido possível.',
    },
    formTitle: 'Envie uma mensagem',
    successMessage: 'Mensagem enviada! A Cris vai responder no e-mail que você informou.',
  },
}
