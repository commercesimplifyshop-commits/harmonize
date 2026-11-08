import type { MediaRecord } from '@harmonize/shared'
import { useId, useRef, useState } from 'react'
import Icon from '../../components/Icon'
import { uploadMedia } from '../api'
import { altFromName, compressImage } from '../compress'
import { useToast } from '../toastContext'

type Item = { name: string; progress: number; error?: string }

/**
 * Picks photos from the gallery (several at once) or opens the camera, compresses them and
 * uploads one at a time, so a weak 4G connection doesn't fail the whole batch.
 */
export default function Uploader({ onUploaded, multiple = true, defaultAlt = '' }: { onUploaded: (media: MediaRecord[]) => void; multiple?: boolean; defaultAlt?: string }) {
  const [items, setItems] = useState<Item[]>([])
  const busy = items.some((i) => i.progress < 1 && !i.error)
  const toast = useToast()
  const galleryId = useId()
  const cameraId = useId()
  const galleryRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  async function handle(files: FileList | null) {
    if (!files || files.length === 0) return
    const list = [...files]
    setItems(list.map((f) => ({ name: f.name, progress: 0 })))
    const done: MediaRecord[] = []
    for (const [index, file] of list.entries()) {
      const update = (patch: Partial<Item>) => setItems((all) => all.map((it, i) => (i === index ? { ...it, ...patch } : it)))
      try {
        const blob = await compressImage(file)
        update({ progress: 0.05 })
        const media = await uploadMedia(blob, defaultAlt || altFromName(file.name), (p) => update({ progress: 0.05 + p * 0.9 }))
        update({ progress: 1 })
        done.push(media)
      } catch (err) {
        update({ error: err instanceof Error ? err.message : 'Falhou' })
      }
    }
    if (done.length > 0) {
      onUploaded(done)
      toast.ok(done.length === 1 ? 'Foto enviada.' : `${done.length} fotos enviadas.`)
    }
    if (galleryRef.current) galleryRef.current.value = ''
    if (cameraRef.current) cameraRef.current.value = ''
    setTimeout(() => setItems((all) => all.filter((i) => i.error)), 1500)
  }

  return (
    <div className="ad-uploader">
      <div className="ad-uploader__buttons">
        <label htmlFor={galleryId} className={`btn btn--green${busy ? ' is-disabled' : ''}`}>
          <Icon name="image" size={18} /> {multiple ? 'Enviar fotos' : 'Enviar foto'}
        </label>
        <input
          ref={galleryRef}
          id={galleryId}
          type="file"
          accept="image/*"
          multiple={multiple}
          disabled={busy}
          className="sr-only"
          onChange={(e) => handle(e.target.files)}
        />
        <label htmlFor={cameraId} className={`btn btn--outline ad-only-touch${busy ? ' is-disabled' : ''}`}>
          <Icon name="camera" size={18} /> Tirar foto
        </label>
        <input
          ref={cameraRef}
          id={cameraId}
          type="file"
          accept="image/*"
          capture="environment"
          disabled={busy}
          className="sr-only"
          onChange={(e) => handle(e.target.files)}
        />
      </div>
      {items.length > 0 && (
        <ul className="ad-uploader__list">
          {items.map((it, i) => (
            <li key={i} className={it.error ? 'is-error' : undefined}>
              <span>{it.name}</span>
              {it.error ? <small>{it.error}</small> : <progress max={1} value={it.progress} aria-label={`Enviando ${it.name}`} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
