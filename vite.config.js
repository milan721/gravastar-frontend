import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5175,
    strictPort: true,
    host: 'localhost',
    open: true,
    hmr: {
      clientPort: 5175,
    },
    headers: {
      // Allow cross-origin popups to communicate via window.postMessage
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})


