import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// SPA statică: fără server, fără proxy. Progresul se salvează în browser (localStorage).
export default defineConfig({
  plugins: [react()],
  build: { target: 'es2022', chunkSizeWarningLimit: 1500 },
});
