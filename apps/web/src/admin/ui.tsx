import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

export function PageHeader({ title, subtitle, back, actions }: { title: string; subtitle?: string; back?: string; actions?: ReactNode }) {
  return (
    <header className="ad-head">
      <div>
        {back && (
          <Link to={back} className="ad-back">
            <Icon name="arrow-left" size={16} /> Voltar
          </Link>
        )}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="ad-head__actions">{actions}</div>}
    </header>
  )
}

export function Spinner({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="ad-spinner" role="status">
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="ad-toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="ad-toggle__track" aria-hidden="true" />
      <span>
        <b>{label}</b>
        {hint && <small>{hint}</small>}
      </span>
    </label>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="ad-empty">{children}</div>
}

/** Bottom bar that stays visible while scrolling long forms, so "Salvar" is always one tap away. */
export function SaveBar({ saving, dirty, onSave, extra }: { saving: boolean; dirty: boolean; onSave: () => void; extra?: ReactNode }) {
  return (
    <div className={`ad-savebar${dirty ? ' is-dirty' : ''}`}>
      <span>{dirty ? 'Há alterações não salvas' : 'Tudo salvo'}</span>
      <div>
        {extra}
        <button type="button" className="btn btn--primary" onClick={onSave} disabled={saving || !dirty}>
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}
