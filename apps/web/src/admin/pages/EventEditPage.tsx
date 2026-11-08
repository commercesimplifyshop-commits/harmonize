import type { AdminEvent, EventCategory, EventInput, MediaRecord } from '@harmonize/shared'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Icon from '../../components/Icon'
import { CATEGORY_LABEL } from '../../lib/format'
import { sized } from '../../lib/media'
import { adminApi } from '../api'
import MediaPicker from '../media/MediaPicker'
import Uploader from '../media/Uploader'
import { useToast } from '../toastContext'
import { PageHeader, SaveBar, Spinner, Toggle } from '../ui'

type Form = Omit<EventInput, 'coverMediaId' | 'galleryMediaIds' | 'guests'> & {
  guests: string
  cover: MediaRecord | null
  gallery: MediaRecord[]
}

const today = () => new Date().toLocaleDateString('en-CA')

const empty = (): Form => ({
  title: '',
  slug: '',
  category: 'casamento',
  date: today(),
  location: '',
  guests: '',
  summary: '',
  description: '',
  cover: null,
  gallery: [],
  published: false,
  featured: false,
})

const fromEvent = (e: AdminEvent): Form => ({
  title: e.title,
  slug: e.slug,
  category: e.category,
  date: e.date,
  location: e.location ?? '',
  guests: e.guests != null ? String(e.guests) : '',
  summary: e.summary,
  description: e.description,
  cover: e.cover,
  gallery: e.gallery,
  published: e.published,
  featured: e.featured,
})

function toInput(f: Form): EventInput {
  const guests = Number.parseInt(f.guests, 10)
  return {
    title: f.title,
    slug: f.slug || undefined,
    category: f.category,
    date: f.date,
    location: f.location || null,
    guests: Number.isFinite(guests) ? guests : null,
    summary: f.summary,
    description: f.description,
    coverMediaId: f.cover?.id ?? null,
    galleryMediaIds: f.gallery.map((m) => m.id),
    published: f.published,
    featured: f.featured,
  }
}

const CATEGORIES = Object.keys(CATEGORY_LABEL) as EventCategory[]

export default function EventEditPage() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState<Form | null>(isNew ? empty() : null)
  const [saved, setSaved] = useState<string>(isNew ? JSON.stringify(empty()) : '')
  const [saving, setSaving] = useState(false)
  const [picking, setPicking] = useState(false)

  useEffect(() => {
    if (isNew) return
    adminApi.event(Number(id)).then((e) => {
      const f = fromEvent(e)
      setForm(f)
      setSaved(JSON.stringify(f))
    }, toast.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!form) return <Spinner />
  const dirty = JSON.stringify(form) !== saved
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => (f ? { ...f, [key]: value } : f))

  const addPhotos = (photos: MediaRecord[]) =>
    setForm((f) => {
      if (!f) return f
      const ids = new Set(f.gallery.map((m) => m.id))
      const gallery = [...f.gallery, ...photos.filter((p) => !ids.has(p.id))]
      return { ...f, gallery, cover: f.cover ?? gallery[0] ?? null }
    })

  const move = (index: number, delta: number) =>
    setForm((f) => {
      if (!f) return f
      const g = [...f.gallery]
      const target = index + delta
      if (target < 0 || target >= g.length) return f
      ;[g[index], g[target]] = [g[target], g[index]]
      return { ...f, gallery: g }
    })

  const removePhoto = (m: MediaRecord) =>
    setForm((f) => (f ? { ...f, gallery: f.gallery.filter((x) => x.id !== m.id), cover: f.cover?.id === m.id ? null : f.cover } : f))

  const save = async () => {
    if (form.title.trim().length < 2) return toast.error(new Error('Dê um título ao evento.'))
    setSaving(true)
    try {
      const result = isNew ? await adminApi.createEvent(toInput(form)) : await adminApi.updateEvent(Number(id), toInput(form))
      const f = fromEvent(result)
      setForm(f)
      setSaved(JSON.stringify(f))
      toast.ok(form.published ? 'Evento salvo e publicado no site.' : 'Rascunho salvo.')
      if (isNew) navigate(`/admin/eventos/${result.id}`, { replace: true })
    } catch (err) {
      toast.error(err)
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!window.confirm(`Apagar o evento "${form.title}"? As fotos continuam na biblioteca.`)) return
    try {
      await adminApi.deleteEvent(Number(id))
      toast.ok('Evento apagado.')
      navigate('/admin/eventos')
    } catch (err) {
      toast.error(err)
    }
  }

  return (
    <>
      <PageHeader
        title={isNew ? 'Novo evento' : form.title || 'Evento'}
        back="/admin/eventos"
        actions={
          !isNew &&
          form.published && (
            <a href={`/eventos/${form.slug}`} target="_blank" rel="noreferrer" className="btn btn--outline">
              <Icon name="eye" size={18} /> Ver no site
            </a>
          )
        }
      />

      <div className="ad-form-grid">
        <section className="ad-card form">
          <h2>Informações</h2>
          <label className="field">
            <span>Título</span>
            <input value={form.title} maxLength={200} onChange={(e) => set('title', e.target.value)} placeholder="Ex.: Casamento Ana & Lucas" />
          </label>
          <div className="form-row">
            <label className="field">
              <span>Tipo de evento</span>
              <select value={form.category} onChange={(e) => set('category', e.target.value as EventCategory)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABEL[c]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Data</span>
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
            </label>
          </div>
          <div className="form-row">
            <label className="field">
              <span>
                Local <small>(opcional)</small>
              </span>
              <input value={form.location ?? ''} maxLength={200} onChange={(e) => set('location', e.target.value)} />
            </label>
            <label className="field">
              <span>
                Convidados <small>(opcional)</small>
              </span>
              <input inputMode="numeric" value={form.guests} onChange={(e) => set('guests', e.target.value.replace(/\D/g, ''))} />
            </label>
          </div>
          <label className="field">
            <span>
              Resumo <small>(aparece no card da lista)</small>
            </span>
            <textarea value={form.summary} maxLength={400} rows={2} onChange={(e) => set('summary', e.target.value)} />
          </label>
          <label className="field">
            <span>
              Descrição <small>(deixe uma linha em branco entre parágrafos)</small>
            </span>
            <textarea value={form.description} rows={8} onChange={(e) => set('description', e.target.value)} />
          </label>
        </section>

        <section className="ad-card form">
          <h2>Publicação</h2>
          <Toggle checked={form.published} onChange={(v) => set('published', v)} label="Publicado no site" hint="Desligado = rascunho, só você vê." />
          <Toggle checked={form.featured} onChange={(v) => set('featured', v)} label="Destaque na home" hint="Aparece em “Eventos realizados” na página inicial." />
          {!isNew && (
            <label className="field">
              <span>
                Endereço da página <small>(gerado do título)</small>
              </span>
              <input value={form.slug ?? ''} maxLength={160} onChange={(e) => set('slug', e.target.value)} />
            </label>
          )}
        </section>
      </div>

      <section className="ad-card">
        <div className="ad-card__head">
          <h2>Fotos ({form.gallery.length})</h2>
          <button type="button" className="ad-link" onClick={() => setPicking(true)}>
            Escolher da biblioteca
          </button>
        </div>
        <Uploader onUploaded={addPhotos} defaultAlt={form.title} />
        {form.gallery.length === 0 ? (
          <p className="ad-muted">Nenhuma foto ainda. A primeira enviada vira a capa.</p>
        ) : (
          <ul className="ad-gallery-edit">
            {form.gallery.map((m, i) => (
              <li key={m.id} className={form.cover?.id === m.id ? 'is-cover' : undefined}>
                <img src={sized(m.thumbUrl ?? m.url, 400)} alt={m.alt} loading="lazy" />
                {form.cover?.id === m.id && <span className="ad-gallery-edit__cover">Capa</span>}
                <div className="ad-gallery-edit__tools">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Mover para antes">
                    <Icon name="arrow-left" size={18} />
                  </button>
                  <button type="button" onClick={() => set('cover', m)} disabled={form.cover?.id === m.id} aria-label="Usar como capa" title="Usar como capa">
                    <Icon name="star" size={18} />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === form.gallery.length - 1} aria-label="Mover para depois">
                    <Icon name="arrow-right" size={18} />
                  </button>
                  <button type="button" onClick={() => removePhoto(m)} aria-label="Tirar do evento" title="Tirar do evento">
                    <Icon name="trash" size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!isNew && (
        <div className="ad-danger-zone">
          <button type="button" className="ad-link-danger" onClick={remove}>
            <Icon name="trash" size={18} /> Apagar evento
          </button>
        </div>
      )}

      <SaveBar saving={saving} dirty={dirty} onSave={save} />
      <MediaPicker
        open={picking}
        multiple
        title="Adicionar fotos ao evento"
        onClose={() => setPicking(false)}
        onPick={(photos) => {
          addPhotos(photos)
          setPicking(false)
        }}
      />
    </>
  )
}
