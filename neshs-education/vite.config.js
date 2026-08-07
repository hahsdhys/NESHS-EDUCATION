import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // ✅ Correct: slash '/' instead of dot '.'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Exposes the dev server to your local network
    port: 5173,      // Default port (optional)
  },
})