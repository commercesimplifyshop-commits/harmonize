import type { Media } from '@harmonize/shared'
import { useEffect, useRef, useState } from 'react'
import { sized } from '../lib/media'
import Icon from './Icon'
import Photo from './Photo'
import './Gallery.css'

/** Uniform grid of square frames; a tap opens the photo full size in a native <dialog>. */
export default function Gallery({ photos, title }: { photos: Media[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const touchX = useRef<number | null>(null)
  const count = photos.length

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open !== null && !d.open) d.showModal()
    if (open === null && d.open) d.close()
  }, [open])

  const step = (delta: number) => setOpen((i) => (i === null ? i : (i + delta + count) % count))

  if (count === 0) return null
  const current = open !== null ? photos[open] : null

  return (
    <>
      <ul className="gallery">
        {photos.map((p, i) => (
          <li key={`${p.url}-${i}`}>
            <button type="button" onClick={() => setOpen(i)} aria-label={`Ampliar foto ${i + 1}: ${p.alt}`}>
              <Photo media={p} ratio="1 / 1" width={600} />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className="lightbox"
        aria-label={`Fotos de ${title}`}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === e.currentTarget && setOpen(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1)
          if (e.key === 'ArrowLeft') step(-1)
        }}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return
          const dx = e.changedTouches[0].clientX - touchX.current
          touchX.current = null
          if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1)
        }}
      >
        {current && (
          <figure>
            <img src={sized(current.url, 1600)} alt={current.alt} />
            <figcaption>
              {current.alt}
              <span>
                {open! + 1} / {count}
              </span>
            </figcaption>
          </figure>
        )}
        <button type="button" className="lightbox__close" onClick={() => setOpen(null)} aria-label="Fechar">
          <Icon name="close" size={26} />
        </button>
        {count > 1 && (
          <>
            <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => step(-1)} aria-label="Foto anterior">
              <Icon name="arrow-left" size={26} />
            </button>
            <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => step(1)} aria-label="Próxima foto">
              <Icon name="arrow-right" size={26} />
            </button>
          </>
        )}
      </dialog>
    </>
  )
}
