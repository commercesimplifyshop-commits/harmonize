import type { PageSummary } from '@harmonize/shared'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/Icon'
import { adminApi } from '../api'
import { useToast } from '../toastContext'
import { PageHeader, Spinner } from '../ui'

const DESCRIPTIONS: Record<string, string> = {
  home: 'Apresentação, serviços, bloco da Cris, como funciona, depoimento e chamada final.',
  sobre: 'Foto e biografia da Cris, a Harmonize e os valores.',
  eventos: 'Topo da página de eventos.',
  orcamento: 'Textos do formulário e a mensagem que abre no WhatsApp.',
  contato: 'Textos do formulário de contato.',
}

export default function PagesPage() {
  const [pages, setPages] = useState<PageSummary[] | null>(null)
  const toast = useToast()

  useEffect(() => {
    adminApi.pages().then(setPages, toast.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <PageHeader title="Páginas" subtitle="Escolha uma página para mudar textos e fotos. Banners e eventos têm telas próprias." />
      {!pages ? (
        <Spinner />
      ) : (
        <ul className="ad-rows">
          {pages.map((p) => (
            <li key={p.slug}>
              <Link to={`/admin/paginas/${p.slug}`} className="ad-row-item">
                <span className="ad-row-item__ph" aria-hidden="true">
                  <Icon name="clipboard" />
                </span>
                <span className="ad-row-item__text">
                  <b>{p.title}</b>
                  <small>{DESCRIPTIONS[p.slug]}</small>
                </span>
                <Icon name="arrow-right" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
