import type { ReactNode } from 'react'
import { data } from '.'
import { SettingsContext, useData } from './hooks'

/** Loads the business settings once; every page renders after they arrive. */
export default function SettingsProvider({ children }: { children: ReactNode }) {
  const { data: settings, error } = useData(() => data.getSettings(), 'settings')
  if (error) return <p style={{ padding: 24 }}>Não foi possível carregar o site. Tente novamente em instantes.</p>
  if (!settings) return null
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>
}
