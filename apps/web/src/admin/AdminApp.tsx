import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import AuthProvider from './AuthProvider'
import { useAuth } from './authContext'
import BannersPage from './pages/BannersPage'
import DashboardPage from './pages/DashboardPage'
import EventEditPage from './pages/EventEditPage'
import EventsPage from './pages/EventsPage'
import LoginPage from './pages/LoginPage'
import MediaPage from './pages/MediaPage'
import MessagesPage from './pages/MessagesPage'
import PageEditPage from './pages/PageEditPage'
import PagesPage from './pages/PagesPage'
import SettingsPage from './pages/SettingsPage'
import ToastProvider from './toast'
import { Spinner } from './ui'
import './admin.css'

const usesApi = import.meta.env.VITE_DATA_SOURCE === 'api'

function Gate() {
  const { user, checking } = useAuth()
  if (checking) return <Spinner label="Verificando acesso…" />
  if (!user) return <LoginPage />
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="eventos" element={<EventsPage />} />
        <Route path="eventos/novo" element={<EventEditPage />} />
        <Route path="eventos/:id" element={<EventEditPage />} />
        <Route path="banners" element={<BannersPage />} />
        <Route path="paginas" element={<PagesPage />} />
        <Route path="paginas/:slug" element={<PageEditPage />} />
        <Route path="fotos" element={<MediaPage />} />
        <Route path="mensagens" element={<MessagesPage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  )
}

/** /admin/*: loaded on demand, so visitors of the public site never download the panel. */
export default function AdminApp() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    document.title = 'Painel · Harmonize'
    return () => meta.remove()
  }, [])

  if (!usesApi) {
    return (
      <div className="ad-standalone">
        <h1>Painel indisponível nesta versão</h1>
        <p>Este build do site usa o conteúdo de demonstração. O painel precisa da API: publique com VITE_DATA_SOURCE=api.</p>
      </div>
    )
  }

  return (
    <ToastProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </ToastProvider>
  )
}
