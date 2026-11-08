import type { AdminBanner, BannerInput, Media } from '@harmonize/shared'
import { useEffect, useState } from 'react'
import Icon from '../../components/Icon'
import { sized } from '../../lib/media'
import { adminApi } from '../api'
import MediaPicker from '../media/MediaPicker'
import { useToast } from '../toastContext'
import { Empty, PageHeader, Spinner, Toggle } from '../ui'

type Draft = BannerInput & { image: Media | null }

const LINKS = [
  { href: '/orcamento', label: 'Orçamento' },
  { href: '/eventos', label: 'Eventos' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/contato', label: 'Contato' },
]

const toDraft = (b: AdminBanner): Draft => ({
  mediaId: b.image.id,
  image: b.image,
  eyebrow: b.eyebrow ?? '',
  title: b.title,
  subtitle: b.subtitle ?? '',
  ctaLabel: b.cta?.label ?? '',
  ctaHref: b.cta?.href ?? '',
  active: b.active,
})

const NEW: Draft = { mediaId: 0, image: null, eyebrow: '', title: '', subtitle: '', ctaLabel: 'Pedir orçamento', ctaHref: '/orcamento', active: true }

function BannerEditor({ initial, onSave, onCancel }: { initial: Draft; onSave: (d: Draft) => Promise<void>; onCancel: () => void }) {
  const [d, setD] = useState(initial)
  const [picking, setPicking] = useState(false)
  const [saving, setSaving] = useState(false)
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }))

  return (
    <div className="ad-card form ad-banner-editor">
      <div className="ad-banner-preview">
        {d.image ? <img src={sized(d.image.url, 1000)} alt="" style={{ objectPosition: d.image.focus }} /> : <span className="ad-muted">Escolha uma foto</span>}
        <div className="ad-banner-preview__shade" />
        <div className="ad-banner-preview__text">
          {d.eyebrow && <small>{d.eyebrow}</small>}
          <b>{d.title || 'Título do banner'}</b>
          {d.subtitle && <span>{d.subtitle}</span>}
        </div>
      </div>
      <button type="button" className="btn btn--outline" onClick={() => setPicking(true)}>
        <Icon name="image" size={18} /> {d.image ? 'Trocar foto' : 'Escolher foto'}
      </button>
      <small className="ad-muted">Prefira fotos deitadas (horizontais). O texto sempre fica sobre uma faixa escura, então qualquer foto funciona.</small>
      <label className="field">
        <span>
          Texto pequeno acima do título <small>(opcional)</small>
        </span>
        <input value={d.eyebrow ?? ''} maxLength={120} onChange={(e) => set('eyebrow', e.target.value)} />
      </label>
      <label className="field">
        <span>Título</span>
        <input value={d.title} maxLength={200} onChange={(e) => set('title', e.target.value)} />
      </label>
      <label className="field">
        <span>
          Subtítulo <small>(opcional)</small>
        </span>
        <textarea rows={2} value={d.subtitle ?? ''} maxLength={400} onChange={(e) => set('subtitle', e.target.value)} />
      </label>
      <div className="form-row">
        <label className="field">
          <span>
            Texto do botão <small>(vazio = sem botão)</small>
          </span>
          <input value={d.ctaLabel ?? ''} maxLength={60} onChange={(e) => set('ctaLabel', e.target.value)} />
        </label>
        <label className="field">
          <span>O botão leva para</span>
          <select value={LINKS.some((l) => l.href === d.ctaHref) ? (d.ctaHref ?? '') : ''} onChange={(e) => set('ctaHref', e.target.value)}>
            {LINKS.map((l) => (
              <option key={l.href} value={l.href}>
                {l.label}
              </option>
            ))}
            {!LINKS.some((l) => l.href === d.ctaHref) && <option value="">{d.ctaHref || 'Escolha'}</option>}
          </select>
        </label>
      </div>
      <Toggle checked={d.active} onChange={(v) => set('active', v)} label="Mostrar no site" />
      <div className="ad-row">
        <button
          type="button"
          className="btn btn--primary"
          disabled={saving || !d.image || !d.title.trim()}
          onClick={async () => {
            setSaving(true)
            await onSave(d).finally(() => setSaving(false))
          }}
        >
          {saving ? 'Salvando…' : 'Salvar banner'}
        </button>
        <button type="button" className="ad-link" onClick={onCancel}>
          Cancelar
        </button>
      </div>
      <MediaPicker
        open={picking}
        onClose={() => setPicking(false)}
        onPick={([m]) => {
          if (m) setD((x) => ({ ...x, mediaId: m.id, image: m }))
          setPicking(false)
        }}
      />
    </div>
  )
}

export default function BannersPage() {
  const [banners, setBanners] = useState<AdminBanner[] | null>(null)
  const [editing, setEditing] = useState<number | 'new' | null>(null)
  const toast = useToast()

  useEffect(() => {
    adminApi.banners().then(setBanners, toast.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = async (id: number | 'new', d: Draft) => {
    const input: BannerInput = {
      mediaId: d.mediaId,
      eyebrow: d.eyebrow || null,
      title: d.title,
      subtitle: d.subtitle || null,
      ctaLabel: d.ctaLabel || null,
      ctaHref: d.ctaLabel ? d.ctaHref || null : null,
      active: d.active,
    }
    try {
      const saved = id === 'new' ? await adminApi.createBanner(input) : await adminApi.updateBanner(id, input)
      setBanners((all) => (id === 'new' ? [...(all ?? []), saved] : (all ?? []).map((b) => (b.id === id ? saved : b))))
      setEditing(null)
      toast.ok('Banner salvo.')
    } catch (err) {
      toast.error(err)
    }
  }

  const move = async (index: number, delta: number) => {
    if (!banners) return
    const list = [...banners]
    const target = index + delta
    if (target < 0 || target >= list.length) return
    ;[list[index], list[target]] = [list[target], list[index]]
    setBanners(list)
    try {
      setBanners(await adminApi.reorderBanners(list.map((b) => b.id)))
    } catch (err) {
      toast.error(err)
    }
  }

  const remove = async (b: AdminBanner) => {
    if (!window.confirm(`Apagar o banner "${b.title}"? A foto continua na biblioteca.`)) return
    try {
      await adminApi.deleteBanner(b.id)
      setBanners((all) => (all ?? []).filter((x) => x.id !== b.id))
      toast.ok('Banner apagado.')
    } catch (err) {
      toast.error(err)
    }
  }

  return (
    <>
      <PageHeader
        title="Banners da home"
        subtitle="Os slides do topo da página inicial, na ordem em que aparecem."
        actions={
          editing === null && (
            <button type="button" className="btn btn--primary" onClick={() => setEditing('new')}>
              <Icon name="plus" size={18} /> Novo banner
            </button>
          )
        }
      />
      {editing === 'new' && <BannerEditor initial={NEW} onSave={(d) => save('new', d)} onCancel={() => setEditing(null)} />}
      {!banners ? (
        <Spinner />
      ) : banners.length === 0 && editing !== 'new' ? (
        <Empty>Nenhum banner. Sem banners, a home começa direto na apresentação.</Empty>
      ) : (
        <ul className="ad-rows">
          {banners.map((b, i) =>
            editing === b.id ? (
              <li key={b.id}>
                <BannerEditor initial={toDraft(b)} onSave={(d) => save(b.id, d)} onCancel={() => setEditing(null)} />
              </li>
            ) : (
              <li key={b.id} className="ad-row-item">
                <img src={sized(b.image.thumbUrl ?? b.image.url, 300)} alt="" className="ad-row-item__wide" />
                <span className="ad-row-item__text">
                  <b>{b.title}</b>
                  <small>{b.active ? `Slide ${i + 1}` : 'Escondido'}</small>
                </span>
                <span className="ad-row-item__tools">
                  <button type="button" className="ad-icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir">
                    <Icon name="up" />
                  </button>
                  <button type="button" className="ad-icon-btn" onClick={() => move(i, 1)} disabled={i === banners.length - 1} aria-label="Descer">
                    <Icon name="down" />
                  </button>
                  <button type="button" className="btn btn--outline" onClick={() => setEditing(b.id)}>
                    Editar
                  </button>
                  <button type="button" className="ad-icon-btn ad-icon-btn--danger" onClick={() => remove(b)} aria-label="Apagar">
                    <Icon name="trash" />
                  </button>
                </span>
              </li>
            ),
          )}
        </ul>
      )}
    </>
  )
}
