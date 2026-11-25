import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Served at /admin/ inside the landing page's static export, whose build
  // copies this build/ folder into its out/admin/.
  base: '/admin/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: { "outDir": "build" },
  server: {
    allowedHosts: [".trycloudflare.com"],
  },
})
