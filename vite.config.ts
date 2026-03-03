import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // Story 2.3 — JWKS lives on backend; proxy so /.well-known/jwks.json hits backend
      '/.well-known': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
