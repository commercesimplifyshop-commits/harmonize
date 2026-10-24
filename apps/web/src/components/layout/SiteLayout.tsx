import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSettings } from '../../data/hooks'
import { whatsappLink } from '../../lib/whatsapp'
import Icon from '../Icon'
import Footer from './Footer'
import Header from './Header'
import TopBar from './TopBar'
import './layout.css'

/** Public site chrome. The admin panel (v2) gets its own layout under /admin. */
export default function SiteLayout() {
  const s = useSettings()
  const { pathname } = useLocation()

  // Braces matter: in recent Chromium scrollTo returns a Promise, which React would treat as a cleanup.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <TopBar />
      <Header />
      <main id="conteudo">
        <Outlet />
      </main>
      <Footer />
      {pathname !== '/orcamento' && (
        <a
          className="wa-float"
          href={whatsappLink(s.whatsapp, 'Olá, Cris! Vim pelo site da Harmonize e gostaria de conversar sobre um evento.')}
          target="_blank"
          rel="noreferrer"
          aria-label="Conversar no WhatsApp"
        >
          <Icon name="whatsapp" size={30} />
        </a>
      )}
    </>
  )
}
