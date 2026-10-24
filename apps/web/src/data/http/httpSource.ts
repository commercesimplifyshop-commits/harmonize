import type { DataSource } from '../source'

/**
 * v2: reads the same content from the NestJS api. The endpoints below are the contract the api
 * has to implement (see docs/ARQUITETURA.md). The api lives on the same domain, under /api.
 */
const base = import.meta.env.VITE_API_URL ?? '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${path} falhou (${res.status})`)
  return res.status === 204 ? (undefined as T) : res.json()
}

export const httpSource: DataSource = {
  getSettings: () => request('/settings'),
  getBanners: () => request('/banners'),
  getPage: (slug) => request(`/pages/${slug}`),
  listEvents: () => request('/events'),
  getEvent: async (slug) => {
    try {
      return await request(`/events/${encodeURIComponent(slug)}`)
    } catch {
      return null
    }
  },
  sendContact: (message) => request('/contact', { method: 'POST', body: JSON.stringify(message) }),
}
