import { Route, Routes } from 'react-router-dom'
import SiteLayout from './components/layout/SiteLayout'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import EventDetailPage from './pages/EventDetailPage'
import EventsPage from './pages/EventsPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import QuotePage from './pages/QuotePage'

// v2 adds /admin/* here as a lazy-loaded route tree with its own layout (see docs/ARQUITETURA.md),
// so visitors of the public site never download the panel's code.
export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="sobre" element={<AboutPage />} />
        <Route path="eventos" element={<EventsPage />} />
        <Route path="eventos/:slug" element={<EventDetailPage />} />
        <Route path="orcamento" element={<QuotePage />} />
        <Route path="contato" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
