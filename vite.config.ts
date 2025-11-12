import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// ESM-compatible __dirname
const __dirname = path.dirname(new URL(import.meta.url).pathname)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Production optimizations
    target: 'es2015',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'sonner', 'react-hot-toast'],
          'vendor-form': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-query': ['@tanstack/react-query', 'axios'],
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Source maps for production debugging (disable for smaller builds)
    sourcemap: false,
  },
  // Server configuration
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: true,
  },
  // Preview configuration
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
  },
})
