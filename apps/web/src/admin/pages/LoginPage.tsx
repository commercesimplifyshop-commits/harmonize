import { useState, type FormEvent } from 'react'
import { captchaToken } from '../../lib/recaptcha'
import { useAuth } from '../authContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSending(true)
    try {
      await login(email.trim(), password, await captchaToken('login'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
      setPassword('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="ad-login">
      <form className="ad-login__card form" onSubmit={submit}>
        <img src="/img/logo-192.png" alt="" width={88} height={88} />
        <h1>Painel Harmonize</h1>
        <p className="ad-muted">Entre para editar o site e registrar eventos.</p>

        <label className="field">
          <span>E-mail</span>
          <input type="email" autoComplete="username" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span>Senha</span>
          <div className="ad-password">
            <input type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" className="ad-link" onClick={() => setShow((s) => !s)}>
              {show ? 'Esconder' : 'Mostrar'}
            </button>
          </div>
        </label>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn--primary" disabled={sending}>
          {sending ? 'Entrando…' : 'Entrar'}
        </button>
        <p className="ad-muted ad-small">Esqueceu a senha? Peça ao Kaio para redefinir.</p>
      </form>
    </div>
  )
}
