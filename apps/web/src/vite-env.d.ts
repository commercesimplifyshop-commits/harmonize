/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "api" switches the site from the bundled demo content to the NestJS api. */
  readonly VITE_DATA_SOURCE?: 'static' | 'api'
  /** Base URL of the api. Defaults to /api on the same domain. */
  readonly VITE_API_URL?: string
}
