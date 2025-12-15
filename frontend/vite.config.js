
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirige /api/* a https://localhost:8443/*
      '/api': {
        target: 'https://localhost:8443',
        changeOrigin: true,
        secure: false, // Ignora certificados SSL autofirmados
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // También proxy para v1 directo si lo necesitas
      '/v1': {
        target: 'https://localhost:8443',
        changeOrigin: true,
        secure: false
      }
    }
  }
})