import type { Banner } from '@harmonize/shared'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { sized } from '../lib/media'
import Icon from './Icon'
import './BannerSlider.css'

const INTERVAL = 6500

/**
 * Home carousel. Banners come from the panel (v2): any photo works because the text sits on a
 * solid dark layer, never directly on the image. Autoplay pauses on hover, focus, touch and
 * when the visitor prefers reduced motion.
 */
export default function BannerSlider({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = banners.length
  const touchX = useRef<number | null>(null)

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count])

  useEffect(() => {
    if (count < 2 || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setTimeout(() => go(index + 1), INTERVAL)
    return () => clearTimeout(t)
  }, [index, paused, count, go])

  if (count === 0) return null

  return (
    <section
      className="slider"
      aria-roledescription="carrossel"
      aria-label="Destaques"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX
        setPaused(true)
      }}
      onTouchEnd={(e) => {
        const start = touchX.current
        touchX.current = null
        if (start === null) return
        const dx = e.changedTouches[0].clientX - start
        if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1))
      }}
    >
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={`slide${i === index ? ' is-active' : ''}`}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} de ${count}`}
          aria-hidden={i !== index}
        >
          <picture className="slide__media">
            <source media="(max-width: 700px)" srcSet={sized(b.image.url, 900)} />
            <img
              src={sized(b.image.url, 1920)}
              alt={b.image.alt}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : undefined}
              style={b.image.focus ? { objectPosition: b.image.focus } : undefined}
            />
          </picture>
          <div className="slide__shade" />
          <div className="wrap slide__content on-dark">
            {b.eyebrow && <span className="eyebrow">{b.eyebrow}</span>}
            {i === 0 ? <h1>{b.title}</h1> : <h2>{b.title}</h2>}
            {b.subtitle && <p>{b.subtitle}</p>}
            {b.cta && (
              <div className="slide__actions">
                <Link to={b.cta.href} className="btn btn--primary" tabIndex={i === index ? 0 : -1}>
                  {b.cta.label}
                </Link>
              </div>
            )}
          </div>
        </div>
      ))}

      {count > 1 && (
        <div className="wrap slider__controls">
          <div className="slider__dots">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                aria-label={`Ir para o destaque ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
              >
                <span style={i === index && !paused ? { animationDuration: `${INTERVAL}ms` } : undefined} />
              </button>
            ))}
          </div>
          <div className="slider__arrows">
            <button type="button" onClick={() => go(index - 1)} aria-label="Destaque anterior">
              <Icon name="arrow-left" />
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Próximo destaque">
              <Icon name="arrow-right" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
