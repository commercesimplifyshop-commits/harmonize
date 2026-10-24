import { useEffect } from 'react'

export function useTitle(title: string | undefined) {
  useEffect(() => {
    document.title = title ? `${title} · Harmonize Eventos` : 'Harmonize Eventos · Assessoria e decoração'
  }, [title])
}
