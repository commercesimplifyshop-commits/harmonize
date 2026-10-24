import type { EventCategory } from '@harmonize/shared'
import { useSearchParams } from 'react-router-dom'
import { Loading, PageHero } from '../components/Blocks'
import EventCard from '../components/EventCard'
import '../components/EventCard.css'
import { data } from '../data'
import { useData, usePage } from '../data/hooks'
import { CATEGORY_LABEL } from '../lib/format'
import { useTitle } from '../lib/page'
import './pages.css'

export default function EventsPage() {
  useTitle('Eventos')
  const { data: page } = usePage('eventos')
  const { data: events } = useData(() => data.listEvents(), 'events')
  // The filter lives in the URL (?tipo=casamento) so a filtered list can be shared.
  const [params, setParams] = useSearchParams()
  const active = params.get('tipo') as EventCategory | null

  if (!page || !events) return <Loading />

  // Only categories that have events show up as filters.
  const categories = [...new Set(events.map((e) => e.category))]
  const list = active ? events.filter((e) => e.category === active) : events

  return (
    <>
      <PageHero hero={page.hero} />
      <section className="section">
        <div className="wrap">
          <div className="chips filter" role="group" aria-label="Filtrar por tipo de evento">
            <button type="button" className="chip" aria-pressed={!active} onClick={() => setParams({}, { replace: true })}>
              Todos
            </button>
            {categories.map((c) => (
              <button key={c} type="button" className="chip" aria-pressed={active === c} onClick={() => setParams({ tipo: c }, { replace: true })}>
                {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>

          {list.length === 0 ? (
            <p className="empty">{page.empty}</p>
          ) : (
            <div className="event-grid">
              {list.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
