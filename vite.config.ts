import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/gomanga-api': {
        target: 'https://gomanga-api.vercel.app',
        changeOrigin: true,
        secure: false, // Allows self-signed certs if any
        rewrite: (path) => path.replace(/^\/gomanga-api/, ''),
      },
    },
  },
})