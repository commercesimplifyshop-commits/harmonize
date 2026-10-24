import { Link } from 'react-router-dom'
import { useTitle } from '../lib/page'
import './pages.css'

export default function NotFoundPage() {
  useTitle('Página não encontrada')
  return (
    <section className="section not-found">
      <div className="wrap">
        <img src="/img/logo-192.png" alt="" width={120} height={120} />
        <h1>Página não encontrada</h1>
        <p className="lead">O endereço pode ter mudado. Que tal voltar ao início ou ver os eventos?</p>
        <div className="not-found__actions">
          <Link to="/" className="btn btn--primary">
            Ir para o início
          </Link>
          <Link to="/eventos" className="btn btn--outline">
            Ver eventos
          </Link>
        </div>
      </div>
    </section>
  )
}
