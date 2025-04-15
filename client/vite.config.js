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

      // ✅ PWA plugin with navigateFallback to fix old service worker caching
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Real Estate CRM',
          short_name: 'RealCRM',
          version: '2.0.0', // optional: helps trigger update on clients
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          navigateFallback: 'index.html',
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true, 
          runtimeCaching: [
            {
              urlPattern: /^https?:\/\/.*\.(js|css|json)/i, 
              handler: 'NetworkFirst'
            },
            {
              urlPattern: /^https?:\/\/.*\.(png|jpg|jpeg|gif|svg|ico)/i,
              handler: 'CacheFirst'
            }
          ]
        }
      })
    ].filter(Boolean),
    build: {
      target: 'es2015',
      sourcemap: !isProd,
      minify: 'terser',
      cssCodeSplit: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@mui')) {
                return 'mui';
              }
              if (id.includes('react')) {
                return 'react';
              }
              return 'vendor';
            }
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]'
        }
      },
      terserOptions: {
        compress: {
          drop_console: isProd,
          drop_debugger: isProd
        }
      }
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: isProd
        },
        '/ws': {
          target: env.VITE_WEBSOCKET_URL || 'ws://localhost:5000',
          ws: true
        }
      }
    },

    preview: {
      port: 4173,
      host: true
    }
  };
});
