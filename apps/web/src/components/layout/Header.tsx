import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Icon from '../Icon'
import Logo from './Logo'
import { NAV } from './nav'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(() => window.scrollY > 8)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className={`header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="wrap header__inner">
        <Logo onClick={() => setOpen(false)} />
        {/* Any link inside closes the mobile menu. */}
        <nav id="menu" className="nav" aria-label="Principal" onClick={(e) => (e.target as HTMLElement).closest('a') && setOpen(false)}>
          <ul>
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === '/'}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link to="/orcamento" className="btn btn--primary nav__cta">
            Pedir orçamento
          </Link>
        </nav>
        <button
          type="button"
          className="header__toggle"
          aria-expanded={open}
          aria-controls="menu"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'close' : 'menu'} size={26} />
        </button>
      </div>
    </header>
  )
}
