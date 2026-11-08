import type { AdminSummary } from '@harmonize/shared'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/Icon'
import { CATEGORY_LABEL, formatDate } from '../../lib/format'
import { adminApi } from '../api'
import { useAuth } from '../authContext'
import { useToast } from '../toastContext'
import { PageHeader, Spinner } from '../ui'

export default function DashboardPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const toast = useToast()

  useEffect(() => {
    adminApi.summary().then(setSummary, toast.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const firstName = user?.name.split(' ')[0] ?? ''

  return (
    <>
      <PageHeader title={`Olá, ${firstName}!`} subtitle="O que você quer fazer hoje?" />

      <div className="ad-quick">
        <Link to="/admin/eventos/novo" className="ad-quick__item ad-quick__item--primary">
          <Icon name="plus" size={26} />
          <b>Registrar evento</b>
          <small>Título, data, descrição e fotos</small>
        </Link>
        <Link to="/admin/banners" className="ad-quick__item">
          <Icon name="layers" size={26} />
          <b>Trocar banners</b>
          <small>Fotos e textos do topo da home</small>
        </Link>
        <Link to="/admin/paginas" className="ad-quick__item">
          <Icon name="clipboard" size={26} />
          <b>Editar páginas</b>
          <small>Textos e fotos de Início, Sobre…</small>
        </Link>
        <Link to="/admin/mensagens" className="ad-quick__item">
          <Icon name="inbox" size={26} />
          <b>Mensagens</b>
          <small>{summary ? `${summary.unreadMessages} não lida(s)` : 'Contato e orçamentos'}</small>
        </Link>
      </div>

      {!summary ? (
        <Spinner />
      ) : (
        <div className="ad-cards">
          <section className="ad-card">
            <h2>Eventos</h2>
            <p className="ad-stat">
              <b>{summary.events.published}</b> publicados · <b>{summary.events.drafts}</b> rascunhos
            </p>
            <p className="ad-muted">{summary.media} fotos na biblioteca</p>
            <Link to="/admin/eventos" className="ad-link">
              Ver todos os eventos →
            </Link>
          </section>
          <section className="ad-card">
            <h2>Próximos eventos</h2>
            {summary.upcoming.length === 0 ? (
              <p className="ad-muted">Nenhum evento com data futura cadastrado.</p>
            ) : (
              <ul className="ad-list-plain">
                {summary.upcoming.map((e) => (
                  <li key={e.id}>
                    <Link to={`/admin/eventos/${e.id}`}>
                      <b>{e.title}</b>
                      <small>
                        {formatDate(e.date)} · {CATEGORY_LABEL[e.category]}
                      </small>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  )
}
