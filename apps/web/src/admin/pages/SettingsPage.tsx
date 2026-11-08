import type { SiteSettings } from '@harmonize/shared'
import { useEffect, useState, type FormEvent } from 'react'
import { adminApi } from '../api'
import { useAuth } from '../authContext'
import { useToast } from '../toastContext'
import { PageHeader, SaveBar, Spinner } from '../ui'

const FIELDS: { key: keyof SiteSettings; label: string; hint?: string; type?: string }[] = [
  { key: 'whatsapp', label: 'WhatsApp (só números)', hint: 'Com 55 e DDD. Ex.: 5575991979918. É para onde vão os orçamentos.', type: 'tel' },
  { key: 'phoneDisplay', label: 'Telefone como aparece no site', hint: 'Ex.: (75) 99197-9918' },
  { key: 'email', label: 'E-mail', type: 'email' },
  { key: 'instagram', label: 'Instagram (sem @)' },
  { key: 'city', label: 'Cidade' },
  { key: 'serviceArea', label: 'Área de atendimento', hint: 'Ex.: Feira de Santana e região' },
  { key: 'ownerName', label: 'Nome da responsável' },
  { key: 'brandName', label: 'Nome da marca' },
  { key: 'brandSuffix', label: 'Complemento da marca', hint: 'Aparece abaixo do nome no logo. Ex.: Eventos' },
  { key: 'tagline', label: 'Frase da marca' },
]

function PasswordForm() {
  const { setUser } = useAuth()
  const toast = useToast()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const mismatch = confirm.length > 0 && next !== confirm

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (next !== confirm) return
    setSaving(true)
    try {
      setUser(await adminApi.changePassword({ currentPassword: current, newPassword: next }))
      setCurrent('')
      setNext('')
      setConfirm('')
      toast.ok('Senha alterada. Outros aparelhos conectados precisarão entrar de novo.')
    } catch (err) {
      toast.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="ad-card form" onSubmit={submit}>
      <h2>Trocar minha senha</h2>
      <label className="field">
        <span>Senha atual</span>
        <input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
      </label>
      <label className="field">
        <span>
          Nova senha <small>(mínimo 10 caracteres; uma frase fácil de lembrar funciona bem)</small>
        </span>
        <input type="password" autoComplete="new-password" minLength={10} value={next} onChange={(e) => setNext(e.target.value)} required />
      </label>
      <label className="field">
        <span>Repita a nova senha</span>
        <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={mismatch} required />
        {mismatch && <span className="field-error">As senhas não são iguais.</span>}
      </label>
      <button type="submit" className="btn btn--green" disabled={saving || mismatch || next.length < 10}>
        {saving ? 'Salvando…' : 'Trocar senha'}
      </button>
    </form>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saved, setSaved] = useState('')
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    adminApi.settings().then((s) => {
      setSettings(s)
      setSaved(JSON.stringify(s))
    }, toast.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = async () => {
    if (!settings) return
    setSaving(true)
    try {
      const s = await adminApi.saveSettings(settings)
      setSettings(s)
      setSaved(JSON.stringify(s))
      toast.ok('Configurações salvas.')
    } catch (err) {
      toast.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Configurações" subtitle="Contatos que aparecem no topo, no rodapé e nos botões de WhatsApp." />
      {!settings ? (
        <Spinner />
      ) : (
        <div className="ad-form-grid">
          <section className="ad-card form">
            <h2>Contatos e marca</h2>
            {FIELDS.map((f) => (
              <label key={f.key} className="field">
                <span>{f.label}</span>
                <input type={f.type ?? 'text'} value={settings[f.key]} onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })} />
                {f.hint && <small className="ad-muted">{f.hint}</small>}
              </label>
            ))}
          </section>
          <PasswordForm />
        </div>
      )}
      {settings && <SaveBar saving={saving} dirty={JSON.stringify(settings) !== saved} onSave={save} />}
    </>
  )
}
