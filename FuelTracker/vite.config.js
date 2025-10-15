import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
 
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Local dev proxy — only used when you run `npm run dev`
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    __API_BASE_URL__: JSON.stringify(process.env.VITE_API_BASE_URL),
  },
  build: {
    outDir: 'dist',
  },
}));