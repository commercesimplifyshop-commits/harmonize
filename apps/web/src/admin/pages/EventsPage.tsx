import type { AdminEvent } from '@harmonize/shared'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/Icon'
import { CATEGORY_LABEL, formatDate } from '../../lib/format'
import { sized } from '../../lib/media'
import { adminApi } from '../api'
import { useToast } from '../toastContext'
import { Empty, PageHeader, Spinner } from '../ui'

export default function EventsPage() {
  const [events, setEvents] = useState<AdminEvent[] | null>(null)
  const [query, setQuery] = useState('')
  const toast = useToast()

  useEffect(() => {
    adminApi.events().then(setEvents, toast.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const q = query.trim().toLowerCase()
  const list = (events ?? []).filter((e) => !q || e.title.toLowerCase().includes(q) || (e.location ?? '').toLowerCase().includes(q))

  return (
    <>
      <PageHeader
        title="Eventos"
        subtitle="Tudo o que aparece em Eventos no site. Rascunhos ficam só aqui."
        actions={
          <Link to="/admin/eventos/novo" className="btn btn--primary">
            <Icon name="plus" size={18} /> Novo evento
          </Link>
        }
      />
      {!events ? (
        <Spinner />
      ) : events.length === 0 ? (
        <Empty>
          Nenhum evento ainda. <Link to="/admin/eventos/novo">Registre o primeiro</Link>.
        </Empty>
      ) : (
        <>
          <label className="field ad-search">
            <span className="sr-only">Buscar evento</span>
            <input type="search" placeholder="Buscar por nome ou local" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <ul className="ad-rows">
            {list.map((e) => (
              <li key={e.id}>
                <Link to={`/admin/eventos/${e.id}`} className="ad-row-item">
                  {e.cover ? (
                    <img src={sized(e.cover.thumbUrl ?? e.cover.url, 200)} alt="" loading="lazy" />
                  ) : (
                    <span className="ad-row-item__ph" aria-hidden="true">
                      <Icon name="image" />
                    </span>
                  )}
                  <span className="ad-row-item__text">
                    <b>{e.title}</b>
                    <small>
                      {formatDate(e.date)} · {CATEGORY_LABEL[e.category]} · {e.gallery.length} foto(s)
                    </small>
                  </span>
                  <span className={`ad-badge${e.published ? ' ad-badge--ok' : ''}`}>{e.published ? 'Publicado' : 'Rascunho'}</span>
                </Link>
              </li>
            ))}
          </ul>
          {list.length === 0 && <p className="ad-muted">Nenhum evento encontrado para “{query}”.</p>}
        </>
      )}
    </>
  )
}
