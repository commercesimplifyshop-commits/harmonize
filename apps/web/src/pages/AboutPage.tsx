import { CtaBand, FeatureGrid, Loading, PageHero } from '../components/Blocks'
import Photo from '../components/Photo'
import { usePage, useSettings } from '../data/hooks'
import { useTitle } from '../lib/page'
import './pages.css'

export default function AboutPage() {
  useTitle('Sobre')
  const s = useSettings()
  const { data: page } = usePage('sobre')
  if (!page) return <Loading />

  return (
    <>
      <PageHero hero={page.hero} />

      <section className="section">
        <div className="wrap split">
          <Photo media={page.portrait} ratio="4 / 5" width={800} label={s.ownerName} className="split__photo split__photo--arch" />
          <div className="split__text">
            <span className="eyebrow">{s.ownerName}</span>
            <h2>{page.bio.title}</h2>
            {page.bio.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p className="signature">{page.bio.signature}</p>
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="wrap split split--reverse">
          <Photo media={page.harmonize.image} ratio="5 / 4" width={900} label={s.brandName} className="split__photo split__photo--framed" />
          <div className="split__text">
            <span className="eyebrow">
              {s.brandName} {s.brandSuffix}
            </span>
            <h2>{page.harmonize.title}</h2>
            {page.harmonize.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head section-head--center">
            <span className="eyebrow">Valores</span>
            <h2>{page.values.title}</h2>
          </div>
          <FeatureGrid items={page.values.items} />
        </div>
      </section>

      <CtaBand title={page.cta.title} text={page.cta.text} buttonLabel={page.cta.buttonLabel} />
    </>
  )
}
