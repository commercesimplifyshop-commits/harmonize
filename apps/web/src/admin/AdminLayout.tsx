import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import Icon from '../components/Icon'
import { useAuth } from './authContext'

const NAV = [
  { to: '/admin', label: 'Início', icon: 'home', end: true },
  { to: '/admin/eventos', label: 'Eventos', icon: 'calendar' },
  { to: '/admin/banners', label: 'Banners da home', icon: 'layers' },
  { to: '/admin/paginas', label: 'Páginas', icon: 'clipboard' },
  { to: '/admin/fotos', label: 'Fotos', icon: 'image' },
  { to: '/admin/mensagens', label: 'Mensagens', icon: 'inbox' },
  { to: '/admin/configuracoes', label: 'Configurações', icon: 'settings' },
] as const

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  // Braces matter: in recent Chromium scrollTo returns a Promise, which React would treat as a cleanup.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className={`ad${open ? ' is-nav-open' : ''}`}>
      <header className="ad-top">
        <button type="button" className="ad-icon-btn ad-top__menu" aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <Icon name={open ? 'close' : 'menu'} size={24} />
        </button>
        <span className="ad-top__brand">
          <img src="/img/logo-96.png" alt="" width={32} height={32} />
          Painel Harmonize
        </span>
        <a href="/" target="_blank" rel="noreferrer" className="ad-top__site">
          <Icon name="eye" size={18} /> <span>Ver site</span>
        </a>
      </header>

      <nav className="ad-nav" aria-label="Painel" onClick={(e) => (e.target as HTMLElement).closest('a') && setOpen(false)}>
        <ul>
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={'end' in item}>
                <Icon name={item.icon} size={20} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="ad-nav__user">
          <span>
            Conectado como <b>{user?.name}</b>
          </span>
          <button type="button" className="ad-link" onClick={logout}>
            <Icon name="logout" size={18} /> Sair
          </button>
        </div>
      </nav>
      <button type="button" className="ad-scrim" aria-label="Fechar menu" tabIndex={-1} onClick={() => setOpen(false)} />

      <main className="ad-main">
        <Outlet />
      </main>
    </div>
  )
}
