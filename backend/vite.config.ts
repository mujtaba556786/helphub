
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  // Served by Express under /admin (server.js), so built asset URLs must resolve
  // under /admin/ instead of the site root (otherwise the JS 404s → blank page).
  base: '/admin/',
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
});
