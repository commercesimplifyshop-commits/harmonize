import type { AuthUser } from '@harmonize/shared'
import { createContext, useContext } from 'react'

export type AuthState = {
  user: AuthUser | null
  checking: boolean
  login: (email: string, password: string, captchaToken?: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: AuthUser) => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth fora do AuthProvider')
  return ctx
}
