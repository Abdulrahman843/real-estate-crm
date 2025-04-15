/* eslint-env node */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  return {
    base: '/',
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Real Estate CRM',
          short_name: 'RealCRM',
          version: '2.0.0',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          navigateFallback: 'index.html',
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
        },
      }),
    ],
    build: {
      target: 'esnext', // modern browsers
      minify: isProd ? 'esbuild' : false, // ✅ avoid Terser
      cssCodeSplit: true,
      sourcemap: true,
      chunkSizeWarningLimit: 1500,
      // ⚠️ remove manualChunks logic to prevent pre-binding 'p'
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: isProd,
        },
        '/ws': {
          target: env.VITE_WEBSOCKET_URL || 'ws://localhost:5000',
          ws: true,
        },
      },
    },
    preview: {
      port: 4173,
      host: true,
    },
  };
});
