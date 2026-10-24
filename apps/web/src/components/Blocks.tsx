import type { Feature } from '@harmonize/shared'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import './Blocks.css'

type Hero = { eyebrow: string; title: string; text: string }

/** Title band at the top of the inner pages. */
export function PageHero({ hero }: { hero: Hero }) {
  return (
    <section className="page-hero on-dark">
      <div className="wrap">
        <span className="eyebrow">{hero.eyebrow}</span>
        <h1>{hero.title}</h1>
        <p>{hero.text}</p>
      </div>
    </section>
  )
}

export function FeatureGrid({ items }: { items: Feature[] }) {
  return (
    <ul className="features">
      {items.map((f) => (
        <li key={f.title} className="feature">
          <span className="feature__icon">
            <Icon name={f.icon} size={26} />
          </span>
          <h3>{f.title}</h3>
          <p>{f.text}</p>
        </li>
      ))}
    </ul>
  )
}

export function CtaBand({ title, text, buttonLabel, to = '/orcamento' }: { title: string; text: string; buttonLabel: string; to?: string }) {
  return (
    <section className="cta-band on-dark">
      <div className="wrap cta-band__inner">
        <img src="/img/logo-192.png" alt="" width={96} height={96} className="cta-band__seal" />
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <Link to={to} className="btn btn--primary">
          {buttonLabel}
        </Link>
      </div>
    </section>
  )
}

export function Loading() {
  return (
    <div className="loading" role="status">
      <span className="sr-only">Carregando…</span>
    </div>
  )
}
