import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import type { ProxyOptions } from 'vite';

// Load environment variables
dotenv.config();

const proxyOptions: Record<string, ProxyOptions> = {
  '/api/stripe': {
    target: 'http://localhost:3001',
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path.replace(/^\/api\/stripe/, '/api/stripe')
  },
  '/api/email': {
    target: 'http://localhost:3002',
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path.replace(/^\/api\/email/, '/api/email')
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          /%VITE_STRIPE_PUBLISHABLE_KEY%/g,
          process.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
        );
      }
    }
  ],
  server: {
    proxy: proxyOptions
  },
  base: '/',
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['@stripe/stripe-js']
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          charts: ['apexcharts', 'react-apexcharts']
        },
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    }
  },
  define: {
    'process.env.STRIPE_SECRET_KEY': JSON.stringify(process.env.STRIPE_SECRET_KEY)
  }
});
