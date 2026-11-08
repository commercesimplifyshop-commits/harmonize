import type { Media } from '@harmonize/shared'
import { useState, type MouseEvent } from 'react'
import { sized } from '../../lib/media'
import MediaPicker from './MediaPicker'

type Props = {
  label: string
  value: Media | null
  onChange: (value: Media | null) => void
  /** Show "Remover" (the site then shows the branded placeholder). */
  allowEmpty?: boolean
  hint?: string
}

/**
 * Current image + "Trocar" (library or upload) + focal point: tapping the preview sets which part
 * of the photo stays visible when the layout crops it (faces, the cake...).
 */
export default function ImageField({ label, value, onChange, allowEmpty = true, hint }: Props) {
  const [picking, setPicking] = useState(false)

  const setFocus = (e: MouseEvent<HTMLButtonElement>) => {
    if (!value) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    onChange({ ...value, focus: `${x}% ${y}%` })
  }

  const [fx, fy] = (value?.focus ?? '50% 50%').split(' ')

  return (
    <div className="ad-image-field">
      <span className="ad-label">{label}</span>
      {value ? (
        <>
          <button type="button" className="ad-image-field__preview" onClick={setFocus} title="Toque no ponto mais importante da foto">
            <img src={sized(value.thumbUrl ?? value.url, 600)} alt={value.alt} style={{ objectPosition: value.focus }} />
            <span className="ad-focus-dot" style={{ left: fx, top: fy }} aria-hidden="true" />
          </button>
          <small className="ad-muted">Toque na foto para marcar o ponto que nunca pode ser cortado.</small>
          <label className="field">
            <span>Descrição da foto</span>
            <input value={value.alt} maxLength={300} onChange={(e) => onChange({ ...value, alt: e.target.value })} placeholder="Ex.: Mesa posta com flores brancas" />
          </label>
        </>
      ) : (
        <div className="ad-image-field__empty">Sem foto: o site mostra o quadro verde com o selo.</div>
      )}
      {hint && <small className="ad-muted">{hint}</small>}
      <div className="ad-row">
        <button type="button" className="btn btn--outline" onClick={() => setPicking(true)}>
          {value ? 'Trocar foto' : 'Escolher foto'}
        </button>
        {value && allowEmpty && (
          <button type="button" className="ad-link-danger" onClick={() => onChange(null)}>
            Remover
          </button>
        )}
      </div>
      <MediaPicker
        open={picking}
        onClose={() => setPicking(false)}
        onPick={([m]) => {
          if (m) onChange({ url: m.url, thumbUrl: m.thumbUrl, alt: m.alt || value?.alt || '', focus: m.focus })
          setPicking(false)
        }}
      />
    </div>
  )
}
