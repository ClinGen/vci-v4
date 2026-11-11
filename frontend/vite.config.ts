import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Local dev only: forward /api to FastAPI (compose.yaml). In AWS, CloudFront routes /api instead.
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
