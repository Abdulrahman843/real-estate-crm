/* eslint-env node */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  return {
    base: './', 
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
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallback: '/index.html', // ✅ ensures fallback to main route
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\.yourapp\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: true
        }
      }),

      mode === 'analyze' && visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html'
      })
    ].filter(Boolean),

    build: {
      target: 'es2015',
      sourcemap: !isProd,
      minify: isProd ? 'terser' : false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            mui: ['@mui/material', '@mui/icons-material'],
            utils: ['axios', 'formik', 'yup'],
            redux: ['@reduxjs/toolkit', 'react-redux']
          },
          assetFileNames: (assetInfo) => {
            if (/\.(gif|jpe?g|png|svg)$/.test(assetInfo.name ?? '')) {
              return 'assets/images/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          }
        }
      }
    },

    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: isProd
        },
        '/ws': {
          target: env.VITE_WEBSOCKET_URL,
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
