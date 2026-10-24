import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    // Same shape as production: /api (and uploads, in v2) go to the NestJS app in apps/api.
    proxy: { '/api': 'http://localhost:3001', '/uploads': 'http://localhost:3001' },
  },
})
