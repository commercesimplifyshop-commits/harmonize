import type { EventCategory, QuoteRequest } from '@harmonize/shared'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loading, PageHero } from '../components/Blocks'
import Icon from '../components/Icon'
import { usePage, useSettings } from '../data/hooks'
import { CATEGORY_LABEL } from '../lib/format'
import { useTitle } from '../lib/page'
import { quoteMessage, whatsappLink } from '../lib/whatsapp'
import './pages.css'

const SERVICES = ['Assessoria completa', 'Decoração', 'Coordenação do dia', 'Indicação de fornecedores']
const CATEGORIES = Object.keys(CATEGORY_LABEL) as EventCategory[]
// en-CA formats as yyyy-mm-dd in the visitor's own timezone.
const today = () => new Date().toLocaleDateString('en-CA')

export default function QuotePage() {
  useTitle('Orçamento')
  const s = useSettings()
  const { data: page } = usePage('orcamento')
  const [params] = useSearchParams()
  const preset = params.get('tipo') as EventCategory | null

  const [form, setForm] = useState<QuoteRequest>({
    name: '',
    category: preset && preset in CATEGORY_LABEL ? preset : 'casamento',
    date: '',
    city: '',
    guests: '',
    services: [],
    message: '',
  })
  const [error, setError] = useState('')
  const set = <K extends keyof QuoteRequest>(key: K, value: QuoteRequest[K]) => setForm((f) => ({ ...f, [key]: value }))
  const toggleService = (name: string) =>
    set('services', form.services.includes(name) ? form.services.filter((x) => x !== name) : [...form.services, name])

  if (!page) return <Loading />

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (form.name.trim().length < 2) {
      setError('Conte como podemos te chamar.')
      return
    }
    setError('')
    // v2: also POST the request to the api so it shows up in the panel as a lead.
    window.open(whatsappLink(s.whatsapp, quoteMessage(page.greeting, form)), '_blank', 'noopener')
  }

  return (
    <>
      <PageHero hero={page.hero} />
      <section className="section section--cream">
        <div className="wrap form-layout">
          <form className="card form-card form" onSubmit={submit} noValidate>
            <h2>{page.formTitle}</h2>

            <div className="form-row">
              <label className="field">
                <span>Seu nome</span>
                <input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  autoComplete="name"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'quote-error' : undefined}
                  required
                />
                {error && (
                  <span id="quote-error" className="field-error">
                    {error}
                  </span>
                )}
              </label>
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
            </div>

            <div className="form-row">
              <label className="field">
                <span>
                  Data <small>(se já tiver)</small>
                </span>
                <input type="date" min={today()} value={form.date} onChange={(e) => set('date', e.target.value)} />
              </label>
              <label className="field">
                <span>Convidados</span>
                <input inputMode="numeric" placeholder="Ex.: 150" value={form.guests} onChange={(e) => set('guests', e.target.value)} />
              </label>
            </div>

            <label className="field">
              <span>Cidade ou local</span>
              <input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Ex.: Feira de Santana, salão de festas" />
            </label>

            <fieldset className="field fieldset">
              <legend>O que você precisa?</legend>
              <div className="chips">
                {SERVICES.map((name) => (
                  <label key={name} className="chip">
                    <input type="checkbox" checked={form.services.includes(name)} onChange={() => toggleService(name)} />
                    {form.services.includes(name) && <Icon name="check" size={16} />}
                    {name}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="field">
              <span>
                Conte mais <small>(opcional)</small>
              </span>
              <textarea
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
                placeholder="Estilo, cores, o que não pode faltar…"
              />
            </label>

            <button type="submit" className="btn btn--primary btn--wa">
              <Icon name="whatsapp" size={20} /> Enviar pelo WhatsApp
            </button>
          </form>

          <aside className="form-aside">
            <img src="/img/logo-192.png" alt="" width={120} height={120} />
            <h2>Atendimento direto com a {s.ownerName.split(' ')[0]}</h2>
            <p>{page.note}</p>
            <ul className="contact-list">
              <li>
                <Icon name="whatsapp" size={20} />
                <a href={whatsappLink(s.whatsapp, page.greeting)} target="_blank" rel="noreferrer">
                  {s.phoneDisplay}
                </a>
              </li>
              <li>
                <Icon name="pin" size={20} />
                <span>{s.serviceArea}</span>
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </>
  )
}
