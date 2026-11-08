import type { MediaRecord } from '@harmonize/shared'
import { useEffect, useRef, useState } from 'react'
import Icon from '../../components/Icon'
import { sized } from '../../lib/media'
import { adminApi } from '../api'
import { useToast } from '../toastContext'
import { Spinner } from '../ui'
import Uploader from './Uploader'

type Props = {
  open: boolean
  onClose: () => void
  onPick: (media: MediaRecord[]) => void
  multiple?: boolean
  title?: string
}

/** Library of every photo already sent, plus upload. Used by pages, banners and events. */
export default function MediaPicker({ open, onClose, onPick, multiple = false, title = 'Escolher foto' }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [items, setItems] = useState<MediaRecord[] | null>(null)
  const [selected, setSelected] = useState<number[]>([])
  const [more, setMore] = useState(false)
  const toast = useToast()

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open && !d.open) {
      d.showModal()
      setSelected([])
      adminApi.media().then(
        (list) => {
          setItems(list)
          setMore(list.length === 60)
        },
        (err) => toast.error(err),
      )
    }
    if (!open && d.open) d.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const loadMore = async () => {
    const last = items?.[items.length - 1]
    if (!last) return
    const next = await adminApi.media(last.id)
    setItems((all) => [...(all ?? []), ...next])
    setMore(next.length === 60)
  }

  const toggle = (m: MediaRecord) => {
    if (!multiple) {
      onPick([m])
      return
    }
    setSelected((s) => (s.includes(m.id) ? s.filter((x) => x !== m.id) : [...s, m.id]))
  }

  const confirm = () => {
    const byId = new Map((items ?? []).map((m) => [m.id, m]))
    onPick(selected.map((id) => byId.get(id)!).filter(Boolean))
  }

  return (
    <dialog ref={dialog} className="ad-dialog ad-picker" onClose={onClose} aria-label={title}>
      <header className="ad-dialog__head">
        <h2>{title}</h2>
        <button type="button" className="ad-icon-btn" onClick={onClose} aria-label="Fechar">
          <Icon name="close" />
        </button>
      </header>
      <div className="ad-dialog__body">
        <Uploader
          multiple={multiple}
          onUploaded={(uploaded) => {
            setItems((all) => [...uploaded, ...(all ?? [])])
            if (multiple) setSelected((s) => [...s, ...uploaded.map((m) => m.id)])
            else onPick(uploaded.slice(0, 1))
          }}
        />
        {!items ? (
          <Spinner />
        ) : items.length === 0 ? (
          <p className="ad-muted">Nenhuma foto ainda. Envie a primeira acima.</p>
        ) : (
          <ul className="ad-grid">
            {items.map((m) => {
              const index = selected.indexOf(m.id)
              return (
                <li key={m.id}>
                  <button type="button" className={`ad-thumb${index >= 0 ? ' is-selected' : ''}`} onClick={() => toggle(m)} aria-pressed={multiple ? index >= 0 : undefined}>
                    <img src={sized(m.thumbUrl ?? m.url, 400)} alt={m.alt} loading="lazy" />
                    {index >= 0 && <span className="ad-thumb__badge">{index + 1}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        {more && (
          <button type="button" className="btn btn--outline" onClick={loadMore}>
            Mostrar mais fotos
          </button>
        )}
      </div>
      {multiple && (
        <footer className="ad-dialog__foot">
          <span>{selected.length} selecionada(s)</span>
          <button type="button" className="btn btn--primary" disabled={selected.length === 0} onClick={confirm}>
            Usar fotos
          </button>
        </footer>
      )}
    </dialog>
  )
}
