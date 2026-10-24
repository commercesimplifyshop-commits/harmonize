import { Link } from 'react-router-dom'
import { CtaBand, FeatureGrid, Loading } from '../components/Blocks'
import BannerSlider from '../components/BannerSlider'
import EventCard from '../components/EventCard'
import Photo from '../components/Photo'
import { data } from '../data'
import { useData, usePage, useSettings } from '../data/hooks'
import { useTitle } from '../lib/page'
import './pages.css'

export default function HomePage() {
  useTitle(undefined)
  const s = useSettings()
  const { data: page } = usePage('home')
  const { data: banners } = useData(() => data.getBanners(), 'banners')
  const { data: events } = useData(() => data.listEvents(), 'events')

  if (!page) return <Loading />
  const featured = (events ?? []).filter((e) => e.featured).slice(0, 3)

  return (
    <>
      <BannerSlider banners={banners ?? []} />

      <section className="section">
        <div className="wrap intro">
          <div>
            <span className="eyebrow">{page.intro.eyebrow}</span>
            <h2>{page.intro.title}</h2>
          </div>
          <div>
            <p className="lead">{page.intro.text}</p>
            <p className="intro__tagline">{s.tagline}</p>
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="wrap">
          <div className="section-head section-head--center">
            <span className="eyebrow">Serviços</span>
            <h2>{page.services.title}</h2>
          </div>
          <FeatureGrid items={page.services.items} />
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <Photo media={page.about.image} ratio="4 / 5" width={800} label={s.ownerName} className="split__photo split__photo--arch" />
          <div className="split__text">
            <span className="eyebrow">{page.about.eyebrow}</span>
            <h2>{page.about.title}</h2>
            <p className="lead">{page.about.text}</p>
            <Link to="/sobre" className="btn btn--outline">
              {page.about.buttonLabel}
            </Link>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="section section--cream">
          <div className="wrap">
            <div className="section-head section-head--row">
              <div>
                <span className="eyebrow">Portfólio</span>
                <h2>{page.events.title}</h2>
                <p>{page.events.text}</p>
              </div>
              <Link to="/eventos" className="btn btn--outline">
                Ver todos
              </Link>
            </div>
            <div className="event-grid">
              {featured.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section section--green">
        <div className="wrap">
          <div className="section-head section-head--center">
            <span className="eyebrow">Como funciona</span>
            <h2>{page.steps.title}</h2>
          </div>
          <ol className="steps">
            {page.steps.items.map((step, i) => (
              <li key={step.title}>
                <span className="steps__n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {page.testimonial && (
        <section className="section">
          <figure className="wrap testimonial">
            <blockquote>“{page.testimonial.quote}”</blockquote>
            <figcaption>
              <b>{page.testimonial.author}</b>
              <span>{page.testimonial.event}</span>
            </figcaption>
          </figure>
        </section>
      )}

      <CtaBand title={page.cta.title} text={page.cta.text} buttonLabel={page.cta.buttonLabel} />
    </>
  )
}
