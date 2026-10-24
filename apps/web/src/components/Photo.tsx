import type { Media } from '@harmonize/shared'
import type { CSSProperties } from 'react'
import { sized } from '../lib/media'
import './Photo.css'

type Props = {
  media: Media | null
  /** Aspect ratio of the frame, e.g. "4 / 3". Omit when the CSS sizes the frame. */
  ratio?: string
  /** Width requested from the CDN. */
  width?: number
  /** Shown on the placeholder when there is no photo. */
  label?: string
  className?: string
  eager?: boolean
  style?: CSSProperties
}

/**
 * The only way pages render photos. The frame comes from the layout, never from the image, so
 * an uploaded photo of any size (or none) keeps the page aligned. Without a photo it shows the
 * brand placeholder: green paper with the seal's bronze ring.
 */
export default function Photo({ media, ratio, width = 900, label, className = '', eager, style }: Props) {
  const box: CSSProperties = { aspectRatio: ratio, ...style }
  if (!media) {
    return (
      <div className={`photo photo--empty ${className}`} style={box} role={label ? 'img' : undefined} aria-label={label}>
        <span className="photo__ring" aria-hidden="true" />
        {label && <span className="photo__label">{label}</span>}
      </div>
    )
  }
  return (
    <div className={`photo ${className}`} style={box}>
      <img
        src={sized(media.url, width)}
        alt={media.alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        style={media.focus ? { objectPosition: media.focus } : undefined}
      />
    </div>
  )
}
