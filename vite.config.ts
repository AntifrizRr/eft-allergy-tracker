import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/eft-allergy-tracker/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp}'],
      },
      manifest: {
        name: 'EFT Allergy Tracker',
        short_name: 'EFT Allergy',
        description: 'Track tested provisions and medicine for the seasonal Allergic modifier in Escape from Tarkov.',
        theme_color: '#11120f',
        background_color: '#11120f',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
