import type { MediaRecord } from '@harmonize/shared'
import { useEffect, useState } from 'react'
import { sized } from '../../lib/media'
import { adminApi } from '../api'
import Uploader from '../media/Uploader'
import { useToast } from '../toastContext'
import { Empty, PageHeader, Spinner } from '../ui'

function MediaDetail({ media, onChange, onDeleted }: { media: MediaRecord; onChange: (m: MediaRecord) => void; onDeleted: () => void }) {
  const [alt, setAlt] = useState(media.alt)
  const toast = useToast()

  const saveAlt = async () => {
    if (alt === media.alt) return
    try {
      onChange(await adminApi.updateMedia(media.id, { alt }))
      toast.ok('Descrição salva.')
    } catch (err) {
      toast.error(err)
    }
  }

  const remove = async () => {
    if (!window.confirm('Apagar esta foto de vez?')) return
    try {
      await adminApi.deleteMedia(media.id)
      onDeleted()
      toast.ok('Foto apagada.')
    } catch (err) {
      toast.error(err)
    }
  }

  return (
    <div className="ad-card ad-media-detail">
      <img src={sized(media.url, 900)} alt={media.alt} />
      <label className="field">
        <span>Descrição (ajuda o Google e quem usa leitor de tela)</span>
        <input value={alt} maxLength={300} onChange={(e) => setAlt(e.target.value)} onBlur={saveAlt} />
      </label>
      <p className="ad-muted ad-small">
        {media.width && media.height ? `${media.width}×${media.height}px · ` : ''}
        {media.size ? `${Math.round(media.size / 1024)} KB · ` : ''}
        enviada em {new Date(media.createdAt).toLocaleDateString('pt-BR')}
      </p>
      <button type="button" className="ad-link-danger" onClick={remove}>
        Apagar foto
      </button>
    </div>
  )
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaRecord[] | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [more, setMore] = useState(false)
  const toast = useToast()

  useEffect(() => {
    adminApi.media().then((list) => {
      setItems(list)
      setMore(list.length === 60)
    }, toast.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadMore = async () => {
    const last = items?.[items.length - 1]
    if (!last) return
    const next = await adminApi.media(last.id)
    setItems((all) => [...(all ?? []), ...next])
    setMore(next.length === 60)
  }

  const current = items?.find((m) => m.id === selected) ?? null

  return (
    <>
      <PageHeader title="Fotos" subtitle="Todas as fotos enviadas. Uma foto em uso num evento, banner ou página não pode ser apagada." />
      <Uploader onUploaded={(list) => setItems((all) => [...list, ...(all ?? [])])} />
      {current && (
        <MediaDetail
          key={current.id}
          media={current}
          onChange={(m) => setItems((all) => (all ?? []).map((x) => (x.id === m.id ? m : x)))}
          onDeleted={() => {
            setItems((all) => (all ?? []).filter((x) => x.id !== current.id))
            setSelected(null)
          }}
        />
      )}
      {!items ? (
        <Spinner />
      ) : items.length === 0 ? (
        <Empty>Nenhuma foto ainda.</Empty>
      ) : (
        <ul className="ad-grid">
          {items.map((m) => (
            <li key={m.id}>
              <button type="button" className={`ad-thumb${selected === m.id ? ' is-selected' : ''}`} onClick={() => setSelected(selected === m.id ? null : m.id)}>
                <img src={sized(m.thumbUrl ?? m.url, 400)} alt={m.alt} loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {more && (
        <button type="button" className="btn btn--outline" onClick={loadMore}>
          Mostrar mais fotos
        </button>
      )}
    </>
  )
}
