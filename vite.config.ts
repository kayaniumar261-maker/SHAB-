import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/SHAB-/',

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
      ],

      manifest: {
        name: 'SHAB Legal Practice Manager',
        short_name: 'SHAB',
        description:
          'SHAB Legal Consultancy case, client, hearing, task and payment management application.',

        theme_color: '#111111',
        background_color: '#111111',

        display: 'standalone',

        orientation: 'portrait-primary',

        start_url: '/SHAB-/',

        scope: '/SHAB-/',

        icons: [
          {
            src: '/SHAB-/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/SHAB-/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/SHAB-/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      workbox: {
        navigateFallback: '/SHAB-/index.html',

        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp,json}',
        ],

        runtimeCaching: [
          {
            urlPattern: ({
              request,
            }) =>
              request.destination ===
              'document',

            handler: 'NetworkFirst',

            options: {
              cacheName:
                'shab-pages',

              networkTimeoutSeconds: 5,

              expiration: {
                maxEntries: 20,
                maxAgeSeconds:
                  60 * 60 * 24 * 30,
              },
            },
          },

          {
            urlPattern: ({
              request,
            }) =>
              request.destination ===
                'script' ||
              request.destination ===
                'style' ||
              request.destination ===
                'worker',

            handler:
              'StaleWhileRevalidate',

            options: {
              cacheName:
                'shab-assets',

              expiration: {
                maxEntries: 100,
                maxAgeSeconds:
                  60 * 60 * 24 * 30,
              },
            },
          },

          {
            urlPattern: ({
              request,
            }) =>
              request.destination ===
                'image' ||
              request.destination ===
                'font',

            handler: 'CacheFirst',

            options: {
              cacheName:
                'shab-media',

              expiration: {
                maxEntries: 100,
                maxAgeSeconds:
                  60 * 60 * 24 * 90,
              },
            },
          },
        ],
      },

      devOptions: {
        enabled: false,
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(
        __dirname,
        './src',
      ),
    },
  },

  server: {
    port: 5173,
    host: true,
  },
});