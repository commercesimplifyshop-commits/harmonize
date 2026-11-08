import type {
  AdminBanner,
  AdminEvent,
  AdminSummary,
  AuthUser,
  BannerInput,
  ChangePasswordRequest,
  EventInput,
  LoginRequest,
  MediaRecord,
  MessageRecord,
  PageSlug,
  PageSummary,
  PagesContent,
  SiteSettings,
} from '@harmonize/shared'

const base = import.meta.env.VITE_API_URL ?? '/api'

export class ApiError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

type Options = { method?: string; body?: unknown; auth?: boolean }

let refreshing: Promise<boolean> | null = null
let onSessionLost: () => void = () => undefined

/** The panel registers what to do when the session can't be renewed (go back to login). */
export const setSessionLostHandler = (fn: () => void) => {
  onSessionLost = fn
}

/** One refresh at a time, even if several requests hit 401 together. */
function refreshSession(): Promise<boolean> {
  refreshing ??= fetch(`${base}/auth/refresh`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'X-Requested-With': 'harmonize' },
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => setTimeout(() => (refreshing = null), 0))
  return refreshing
}

async function errorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json()
    const message = Array.isArray(data.message) ? data.message[0] : data.message
    if (typeof message === 'string' && res.status < 500) return message
  } catch {
    /* not JSON */
  }
  if (res.status === 413) return 'Arquivo grande demais.'
  if (res.status >= 500) return 'O servidor teve um problema. Tente de novo em instantes.'
  return 'Não foi possível concluir. Tente de novo.'
}

async function request<T>(path: string, { method = 'GET', body, auth = true }: Options = {}, retry = true): Promise<T> {
  const headers: Record<string, string> = { 'X-Requested-With': 'harmonize' }
  if (body !== undefined && !(body instanceof FormData)) headers['Content-Type'] = 'application/json'
  let res: Response
  try {
    res = await fetch(`${base}${path}`, {
      method,
      credentials: 'same-origin',
      headers,
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Sem conexão. Confira a internet e tente de novo.', 0)
  }

  if (res.status === 401 && auth && retry) {
    if (await refreshSession()) return request<T>(path, { method, body, auth }, false)
    onSessionLost()
  }
  if (!res.ok) throw new ApiError(await errorMessage(res), res.status)
  return (res.status === 204 ? undefined : await res.json()) as T
}

/** Upload with progress (fetch can't report upload progress). */
export function uploadMedia(file: Blob, alt: string, onProgress?: (fraction: number) => void, retry = true): Promise<MediaRecord> {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append('file', file, 'foto.jpg')
    form.append('alt', alt)
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${base}/admin/media`)
    xhr.withCredentials = true
    xhr.setRequestHeader('X-Requested-With', 'harmonize')
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total)
    xhr.onerror = () => reject(new ApiError('Sem conexão. Confira a internet e tente de novo.', 0))
    xhr.onload = async () => {
      if (xhr.status === 401 && retry && (await refreshSession())) {
        uploadMedia(file, alt, onProgress, false).then(resolve, reject)
        return
      }
      if (xhr.status >= 200 && xhr.status < 300) return resolve(JSON.parse(xhr.responseText))
      if (xhr.status === 401) onSessionLost()
      reject(new ApiError(await errorMessage(new Response(xhr.responseText, { status: xhr.status })), xhr.status))
    }
    xhr.send(form)
  })
}

export const adminApi = {
  login: (data: LoginRequest) => request<AuthUser>('/auth/login', { method: 'POST', body: data, auth: false }),
  logout: () => request<void>('/auth/logout', { method: 'POST', auth: false }),
  me: () => request<AuthUser>('/auth/me'),
  changePassword: (data: ChangePasswordRequest) => request<AuthUser>('/auth/password', { method: 'POST', body: data }),

  summary: () => request<AdminSummary>('/admin/summary'),

  settings: () => request<SiteSettings>('/settings', { auth: false }),
  saveSettings: (data: SiteSettings) => request<SiteSettings>('/admin/settings', { method: 'PUT', body: data }),

  pages: () => request<PageSummary[]>('/admin/pages'),
  page: <S extends PageSlug>(slug: S) => request<PagesContent[S]>(`/admin/pages/${slug}`),
  savePage: <S extends PageSlug>(slug: S, content: PagesContent[S]) => request<PagesContent[S]>(`/admin/pages/${slug}`, { method: 'PUT', body: content }),

  banners: () => request<AdminBanner[]>('/admin/banners'),
  createBanner: (data: BannerInput) => request<AdminBanner>('/admin/banners', { method: 'POST', body: data }),
  updateBanner: (id: number, data: BannerInput) => request<AdminBanner>(`/admin/banners/${id}`, { method: 'PUT', body: data }),
  deleteBanner: (id: number) => request<void>(`/admin/banners/${id}`, { method: 'DELETE' }),
  reorderBanners: (ids: number[]) => request<AdminBanner[]>('/admin/banners/order', { method: 'PUT', body: { ids } }),

  events: () => request<AdminEvent[]>('/admin/events'),
  event: (id: number) => request<AdminEvent>(`/admin/events/${id}`),
  createEvent: (data: EventInput) => request<AdminEvent>('/admin/events', { method: 'POST', body: data }),
  updateEvent: (id: number, data: EventInput) => request<AdminEvent>(`/admin/events/${id}`, { method: 'PUT', body: data }),
  deleteEvent: (id: number) => request<void>(`/admin/events/${id}`, { method: 'DELETE' }),

  media: (before?: number) => request<MediaRecord[]>(`/admin/media?limit=60${before ? `&before=${before}` : ''}`),
  updateMedia: (id: number, data: { alt?: string; focus?: string | null }) => request<MediaRecord>(`/admin/media/${id}`, { method: 'PATCH', body: data }),
  deleteMedia: (id: number) => request<void>(`/admin/media/${id}`, { method: 'DELETE' }),

  messages: () => request<MessageRecord[]>('/admin/messages'),
  markMessage: (id: number, read: boolean) => request<void>(`/admin/messages/${id}`, { method: 'PATCH', body: { read } }),
  deleteMessage: (id: number) => request<void>(`/admin/messages/${id}`, { method: 'DELETE' }),
}
