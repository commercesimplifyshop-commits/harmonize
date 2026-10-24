import { useSettings } from '../../data/hooks'
import { whatsappLink } from '../../lib/whatsapp'
import Icon from '../Icon'

/** One line above the header with WhatsApp, e-mail and Instagram. */
export default function TopBar() {
  const s = useSettings()
  return (
    <div className="topbar">
      <div className="wrap topbar__inner">
        <a href={whatsappLink(s.whatsapp, 'Olá, Cris! Vim pelo site da Harmonize.')} target="_blank" rel="noreferrer">
          <Icon name="whatsapp" size={15} />
          <span>{s.phoneDisplay}</span>
        </a>
        <a href={`mailto:${s.email}`} className="topbar__email">
          <Icon name="mail" size={15} />
          <span>{s.email}</span>
        </a>
        <a href={`https://instagram.com/${s.instagram}`} target="_blank" rel="noreferrer" className="topbar__ig">
          <Icon name="instagram" size={15} />
          <span className="topbar__ig-handle">@{s.instagram}</span>
          <span className="sr-only">Instagram</span>
        </a>
      </div>
    </div>
  )
}
