import type { PagesContent, PageSlug, SiteSettings } from '@harmonize/shared'
import { createContext, useContext, useEffect, useState } from 'react'
import { data } from '.'

type State<T> = { data: T | undefined; error: Error | null; loading: boolean }

/** Runs an async loader and re-runs it when `key` changes. Stale responses are ignored. */
export function useData<T>(load: () => Promise<T>, key: string): State<T> {
  const [state, setState] = useState<State<T>>({ data: undefined, error: null, loading: true })
  useEffect(() => {
    let alive = true
    load().then(
      (d) => alive && setState({ data: d, error: null, loading: false }),
      (e: Error) => alive && setState({ data: undefined, error: e, loading: false }),
    )
    return () => {
      alive = false
      setState({ data: undefined, error: null, loading: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return state
}

export const usePage = <S extends PageSlug>(slug: S) => useData<PagesContent[S]>(() => data.getPage(slug), `page:${slug}`)

export const SettingsContext = createContext<SiteSettings | null>(null)

export function useSettings(): SiteSettings {
  const s = useContext(SettingsContext)
  if (!s) throw new Error('useSettings fora do SettingsProvider')
  return s
}
