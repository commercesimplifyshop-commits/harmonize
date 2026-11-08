import type { AuthUser } from '@harmonize/shared'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { adminApi, ApiError, setSessionLostHandler } from './api'
import { AuthContext } from './authContext'

/** Checks the session once on load; any request that can't renew the session logs the panel out. */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    setSessionLostHandler(() => setUser(null))
    adminApi
      .me()
      .then(setUser)
      .catch((err: unknown) => {
        if (!(err instanceof ApiError) || err.status !== 401) console.error(err)
      })
      .finally(() => setChecking(false))
  }, [])

  const login = useCallback(async (email: string, password: string, captchaToken?: string) => {
    setUser(await adminApi.login({ email, password, captchaToken }))
  }, [])

  const logout = useCallback(async () => {
    await adminApi.logout().catch(() => undefined)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, checking, login, logout, setUser }), [user, checking, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
