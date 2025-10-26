// client/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Define proxy for API calls during local development
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Express server
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Optionally fix the warning by explicitly including the main dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
})