import type { EventItem } from '@harmonize/shared'
import { Link } from 'react-router-dom'
import { CATEGORY_LABEL, formatMonthYear } from '../lib/format'
import Photo from './Photo'
import './EventCard.css'

export default function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="event-card">
      <Link to={`/eventos/${event.slug}`} className="event-card__link">
        <Photo media={event.cover} ratio="4 / 3" width={700} label={event.title} className="event-card__photo" />
        <div className="event-card__body">
          <p className="event-card__meta">
            <span>{CATEGORY_LABEL[event.category]}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={event.date}>{formatMonthYear(event.date)}</time>
          </p>
          <h3>{event.title}</h3>
          <p className="event-card__summary">{event.summary}</p>
          <span className="event-card__more">Ver evento</span>
        </div>
      </Link>
    </article>
  )
}
