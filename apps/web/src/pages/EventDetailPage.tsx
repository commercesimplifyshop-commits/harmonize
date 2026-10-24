import { Link, useParams } from 'react-router-dom'
import { CtaBand, Loading } from '../components/Blocks'
import Gallery from '../components/Gallery'
import Icon from '../components/Icon'
import Photo from '../components/Photo'
import { data } from '../data'
import { useData } from '../data/hooks'
import { CATEGORY_LABEL, formatDate, paragraphs } from '../lib/format'
import { useTitle } from '../lib/page'
import NotFoundPage from './NotFoundPage'
import './pages.css'

export default function EventDetailPage() {
  const { slug = '' } = useParams()
  const { data: event, loading } = useData(() => data.getEvent(slug), `event:${slug}`)
  useTitle(event?.title)

  if (loading) return <Loading />
  if (!event) return <NotFoundPage />

  return (
    <>
      <section className="event-hero on-dark">
        <Photo media={event.cover} width={1920} label={event.title} className="event-hero__bg" eager />
        <div className="event-hero__shade" />
        <div className="wrap event-hero__content">
          <Link to="/eventos" className="back-link">
            <Icon name="arrow-left" size={18} /> Todos os eventos
          </Link>
          <span className="eyebrow">{CATEGORY_LABEL[event.category]}</span>
          <h1>{event.title}</h1>
          <ul className="event-facts">
            <li>
              <Icon name="calendar" size={18} />
              <time dateTime={event.date}>{formatDate(event.date)}</time>
            </li>
            {event.location && (
              <li>
                <Icon name="pin" size={18} />
                {event.location}
              </li>
            )}
            {event.guests && (
              <li>
                <Icon name="users" size={18} />
                {event.guests} convidados
              </li>
            )}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap event-body">
          <p className="lead event-body__summary">{event.summary}</p>
          {paragraphs(event.description).map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>

      {event.gallery.length > 0 && (
        <section className="section section--cream">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">Galeria</span>
              <h2>Fotos do evento</h2>
            </div>
            <Gallery photos={event.gallery} title={event.title} />
          </div>
        </section>
      )}

      <CtaBand
        title="Quer um evento assim?"
        text={`Conte como você imagina o seu ${CATEGORY_LABEL[event.category].toLowerCase()}. A Cris monta uma proposta para você.`}
        buttonLabel="Pedir orçamento"
        to={`/orcamento?tipo=${event.category}`}
      />
    </>
  )
}
