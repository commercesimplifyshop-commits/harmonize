import type { DataSource } from '../source'

/**
 * Reads the site content from the NestJS api (apps/api), on the same domain under /api.
 * Writes carry the header the api's CSRF guard expects.
 */
const base = import.meta.env.VITE_API_URL ?? '/api'

class HttpError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'harmonize', ...init?.headers },
  })
  if (!res.ok) {
    let message = 'Não foi possível concluir agora. Tente de novo em instantes.'
    try {
      const data = await res.json()
      if (res.status < 500 && typeof data.message === 'string') message = data.message
    } catch {
      /* not JSON */
    }
    throw new HttpError(message, res.status)
  }
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
    } catch (err) {
      if (err instanceof HttpError && err.status === 404) return null
      throw err
    }
  },
  sendContact: (message) => request('/contact', { method: 'POST', body: JSON.stringify(message) }),
  sendQuote: (quote) => request('/quotes', { method: 'POST', body: JSON.stringify(quote) }),
}
