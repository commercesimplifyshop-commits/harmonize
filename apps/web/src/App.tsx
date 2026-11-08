import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Loading } from './components/Blocks'
import SiteLayout from './components/layout/SiteLayout'
import SettingsProvider from './data/SettingsProvider'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import EventDetailPage from './pages/EventDetailPage'
import EventsPage from './pages/EventsPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import QuotePage from './pages/QuotePage'

// The panel is its own chunk: visitors of the public site never download it.
const AdminApp = lazy(() => import('./admin/AdminApp'))

export default function App() {
  return (
    <Routes>
      <Route
        path="admin/*"
        element={
          <Suspense fallback={<Loading />}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route
        element={
          <SettingsProvider>
            <SiteLayout />
          </SettingsProvider>
        }
      >
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
