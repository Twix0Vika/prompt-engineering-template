import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const frontendRoot = import.meta.dirname
const projectRoot = path.resolve(frontendRoot, '..')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(frontendRoot, './src'),
      '@features': path.resolve(projectRoot, 'features'),
    },
  },
  server: {
    port: 5175,
  },
  optimizeDeps: {
    // Pre-bundle these so Vite doesn't lose them when traversing
    // files that live outside the frontend/ root (the @features alias).
    include: [
      '@reduxjs/toolkit',
      '@reduxjs/toolkit/query/react',
      'react-redux',
      'react',
      'react-dom',
      'use-sync-external-store',
      'react-router-dom',
    ],
  },
})
