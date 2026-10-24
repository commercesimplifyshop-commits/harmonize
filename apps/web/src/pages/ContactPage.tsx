import type { ContactMessage } from '@harmonize/shared'
import { useState, type FormEvent } from 'react'
import { Loading, PageHero } from '../components/Blocks'
import Icon from '../components/Icon'
import { data } from '../data'
import { usePage, useSettings } from '../data/hooks'
import { useTitle } from '../lib/page'
import { whatsappLink } from '../lib/whatsapp'
import './pages.css'

type Errors = Partial<Record<keyof ContactMessage, string>>
const EMPTY: ContactMessage = { name: '', email: '', phone: '', subject: '', message: '', website: '' }

function validate(m: ContactMessage): Errors {
  const e: Errors = {}
  if (m.name.trim().length < 2) e.name = 'Informe seu nome.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m.email.trim())) e.email = 'Informe um e-mail válido.'
  if (m.subject.trim().length < 3) e.subject = 'Informe o assunto.'
  if (m.message.trim().length < 10) e.message = 'Escreva sua mensagem (pelo menos 10 caracteres).'
  return e
}

export default function ContactPage() {
  useTitle('Contato')
  const s = useSettings()
  const { data: page } = usePage('contato')
  const [form, setForm] = useState<ContactMessage>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  if (!page) return <Loading />

  const set = (key: keyof ContactMessage, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setStatus('sending')
    try {
      await data.sendContact(form)
      setStatus('sent')
      setForm(EMPTY)
    } catch {
      setStatus('error')
    }
  }

  const field = (key: 'name' | 'email' | 'subject', label: string, type = 'text', autoComplete?: string) => (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        autoComplete={autoComplete}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `err-${key}` : undefined}
      />
      {errors[key] && (
        <span id={`err-${key}`} className="field-error">
          {errors[key]}
        </span>
      )}
    </label>
  )

  return (
    <>
      <PageHero hero={page.hero} />
      <section className="section section--cream">
        <div className="wrap form-layout">
          <form className="card form-card form" onSubmit={submit} noValidate>
            <h2>{page.formTitle}</h2>
            {status === 'sent' ? (
              <div className="notice" role="status">
                <b>{page.successMessage}</b>
                <button type="button" className="link-button" onClick={() => setStatus('idle')}>
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <>
                <div className="form-row">
                  {field('name', 'Nome', 'text', 'name')}
                  {field('email', 'E-mail', 'email', 'email')}
                </div>
                <div className="form-row">
                  <label className="field">
                    <span>
                      Telefone <small>(opcional)</small>
                    </span>
                    <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" />
                  </label>
                  {field('subject', 'Assunto')}
                </div>
                <label className="field">
                  <span>Mensagem</span>
                  <textarea
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'err-message' : undefined}
                  />
                  {errors.message && (
                    <span id="err-message" className="field-error">
                      {errors.message}
                    </span>
                  )}
                </label>
                {/* Honeypot: hidden from people, bots fill it and the api discards the message. */}
                <label className="hp" aria-hidden="true">
                  Site
                  <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} />
                </label>
                {status === 'error' && (
                  <p className="field-error" role="alert">
                    Não foi possível enviar agora. Tente de novo ou fale pelo WhatsApp.
                  </p>
                )}
                <button type="submit" className="btn btn--green" disabled={status === 'sending'}>
                  <Icon name="send" size={18} /> {status === 'sending' ? 'Enviando…' : 'Enviar mensagem'}
                </button>
              </>
            )}
          </form>

          <aside className="form-aside">
            <h2>Outros canais</h2>
            <ul className="contact-list">
              <li>
                <Icon name="whatsapp" size={20} />
                <a href={whatsappLink(s.whatsapp, 'Olá, Cris! Vim pelo site da Harmonize.')} target="_blank" rel="noreferrer">
                  {s.phoneDisplay}
                </a>
              </li>
              <li>
                <Icon name="mail" size={20} />
                <a href={`mailto:${s.email}`}>{s.email}</a>
              </li>
              <li>
                <Icon name="instagram" size={20} />
                <a href={`https://instagram.com/${s.instagram}`} target="_blank" rel="noreferrer">
                  @{s.instagram}
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
