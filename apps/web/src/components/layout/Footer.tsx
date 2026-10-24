import { Link } from 'react-router-dom'
import { useSettings } from '../../data/hooks'
import { whatsappLink } from '../../lib/whatsapp'
import Icon from '../Icon'
import Logo from './Logo'
import { NAV } from './nav'

const YEAR = new Date().getFullYear()

export default function Footer() {
  const s = useSettings()
  return (
    <footer className="footer on-dark">
      <div className="wrap footer__grid">
        <div className="footer__brand">
          <Logo variant="light" />
          <p>{s.tagline}</p>
          <p className="footer__owner">por {s.ownerName}</p>
        </div>

        <div>
          <h2 className="footer__title">Navegue</h2>
          <ul className="footer__list">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="footer__title">Fale com a gente</h2>
          <ul className="footer__list footer__contacts">
            <li>
              <a href={whatsappLink(s.whatsapp, 'Olá, Cris! Vim pelo site da Harmonize.')} target="_blank" rel="noreferrer">
                <Icon name="whatsapp" size={18} /> {s.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${s.email}`}>
                <Icon name="mail" size={18} /> {s.email}
              </a>
            </li>
            <li>
              <a href={`https://instagram.com/${s.instagram}`} target="_blank" rel="noreferrer">
                <Icon name="instagram" size={18} /> @{s.instagram}
              </a>
            </li>
            <li>
              <span>
                <Icon name="pin" size={18} /> {s.serviceArea}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="wrap footer__bottom">
        <p>
          © {YEAR} {s.brandName} {s.brandSuffix}. Todos os direitos reservados.
        </p>
        <p>Versão de demonstração: eventos e fotos são ilustrativos.</p>
      </div>
    </footer>
  )
}
