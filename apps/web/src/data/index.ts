import { httpSource } from './http/httpSource'
import type { DataSource } from './source'
import { staticSource } from './static/staticSource'

// v1 ships the static demo content. Set VITE_DATA_SOURCE=api once the api and database are live.
export const data: DataSource = import.meta.env.VITE_DATA_SOURCE === 'api' ? httpSource : staticSource
