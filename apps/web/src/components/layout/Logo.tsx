import { Link } from 'react-router-dom'
import { useSettings } from '../../data/hooks'

export default function Logo({ variant = 'dark', onClick }: { variant?: 'dark' | 'light'; onClick?: () => void }) {
  const s = useSettings()
  return (
    <Link to="/" className={`logo logo--${variant}`} onClick={onClick} aria-label={`${s.brandName} ${s.brandSuffix}, página inicial`}>
      <img src="/img/logo-96.png" srcSet="/img/logo-96.png 1x, /img/logo-192.png 2x" alt="" width={48} height={48} />
      <span className="logo__text">
        <b>{s.brandName}</b>
        <small>{s.brandSuffix}</small>
      </span>
    </Link>
  )
}
