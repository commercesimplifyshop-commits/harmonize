import type { PageSlug, PagesContent } from '@harmonize/shared'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Icon from '../../components/Icon'
import { adminApi } from '../api'
import { useToast } from '../toastContext'
import { PageHeader, SaveBar, Spinner } from '../ui'
import ContentField, { type Json } from './ContentField'
import { LABELS, PAGE_PATHS } from './fieldLabels'

const TITLES: Record<string, string> = { home: 'Início', sobre: 'Sobre', eventos: 'Eventos', orcamento: 'Orçamento', contato: 'Contato' }

export default function PageEditPage() {
  const { slug = '' } = useParams()
  const [content, setContent] = useState<Record<string, Json> | null>(null)
  const [saved, setSaved] = useState('')
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    adminApi.page(slug as PageSlug).then((c) => {
      setContent(c as unknown as Record<string, Json>)
      setSaved(JSON.stringify(c))
    }, toast.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  if (!content) return <Spinner />
  const dirty = JSON.stringify(content) !== saved

  const save = async () => {
    setSaving(true)
    try {
      const result = await adminApi.savePage(slug as PageSlug, content as unknown as PagesContent[PageSlug])
      setContent(result as unknown as Record<string, Json>)
      setSaved(JSON.stringify(result))
      toast.ok('Página salva. Já está no site.')
    } catch (err) {
      toast.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title={`Página ${TITLES[slug] ?? slug}`}
        subtitle="Mude o que quiser e toque em Salvar. A mudança aparece no site na hora."
        back="/admin/paginas"
        actions={
          <a href={PAGE_PATHS[slug] ?? '/'} target="_blank" rel="noreferrer" className="btn btn--outline">
            <Icon name="eye" size={18} /> Ver página
          </a>
        }
      />
      {Object.entries(content).map(([key, value]) => (
        <details key={key} className="ad-card ad-section" open={Object.keys(content).length <= 3}>
          <summary>
            <h2>{LABELS[key] ?? key}</h2>
          </summary>
          <ContentField name={key} value={value} onChange={(v) => setContent((c) => (c ? { ...c, [key]: v } : c))} />
        </details>
      ))}
      <SaveBar saving={saving} dirty={dirty} onSave={save} />
    </>
  )
}
