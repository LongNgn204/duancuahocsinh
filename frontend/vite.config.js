import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// Generate version từ timestamp
const APP_VERSION = Date.now().toString()

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'replace-sw-version',
      writeBundle() {
        // Replace version trong sw.js sau khi build
        try {
          const swPath = resolve(__dirname, 'dist/sw.js');
          const swContent = readFileSync(swPath, 'utf-8')
            .replace(/__APP_VERSION__/g, APP_VERSION);
          writeFileSync(swPath, swContent);
          console.log('[Vite] Updated sw.js with version:', APP_VERSION);
        } catch (err) {
          console.warn('[Vite] Could not update sw.js version:', err.message);
        }
      },
    },
  ],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(APP_VERSION),
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    minify: 'esbuild',
    // Code splitting optimization
    rollupOptions: {
      output: {
        // Manual chunks để tối ưu bundle size
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'utils-vendor': ['zustand', 'react-markdown'],
        },
      },
      onwarn(warning, warn) {
        // Suppress circular dependency warnings
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
  },
})
