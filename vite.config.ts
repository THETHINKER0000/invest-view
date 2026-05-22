import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Base path: '/' for custom domains / Vercel / Netlify,
// '/invest-view/' for GitHub Pages (set via VITE_BASE env at build time).
const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-')) return 'recharts'
            if (id.includes('@dnd-kit')) return 'dnd'
            if (id.includes('react') || id.includes('scheduler')) return 'react'
            return 'vendor'
          }
        },
      },
    },
  },
})
