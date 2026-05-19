import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Target modern browser agar output lebih ringan
    target: 'es2020',
    // Pisahkan CSS per chunk agar tidak semua CSS diload sekaligus
    cssCodeSplit: true,
    // Kompres lebih agresif (Vite 8 pakai oxc, bukan esbuild)
    minify: 'oxc',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('phaser')) return 'vendor-phaser';
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react';
            if (id.includes('zustand')) return 'vendor-zustand';
            return 'vendor-other';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})

