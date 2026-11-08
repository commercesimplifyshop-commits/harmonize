import { createContext, useContext } from 'react'
import { ApiError } from './api'

export type ToastKind = 'ok' | 'error'

export const ToastContext = createContext<{ show: (text: string, kind?: ToastKind) => void } | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast fora do ToastProvider')
  return {
    ok: (text: string) => ctx.show(text, 'ok'),
    error: (err: unknown) => ctx.show(err instanceof ApiError || err instanceof Error ? err.message : 'Algo deu errado.', 'error'),
  }
}
