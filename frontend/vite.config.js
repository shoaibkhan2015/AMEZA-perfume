import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, /api calls are forwarded to the Express server on port 4000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: ['come-barbed-imperfect.ngrok-free.dev'],
    proxy: { '/api': 'http://localhost:4000' },
  },
});
