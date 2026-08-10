# EFT Allergy Tracker

Mobile-first PWA companion for the seasonal **Allergic** modifier in Escape from Tarkov.

The tracker is designed for one fast raid-time action: find a provision or medical item and mark it as safe or allergic. Progress is stored locally on the device.

## Current features

- live consumable catalog synced from the Tarkov.dev GraphQL API during deployment
- provisions, medicine and injectors
- Russian / English names and instant language switching
- search across both languages
- status and category filters
- `unknown`, `safe`, `allergic` states
- allergy counter capped by the game mechanic at 3 selections
- local persistence with `localStorage`
- item icons downloaded at build time
- offline-capable PWA with item icons included in the precache
- automatic GitHub Pages deployment

## Stack

- React
- TypeScript
- Vite
- vite-plugin-pwa / Workbox
- Tarkov.dev GraphQL API
- localStorage
- GitHub Actions + GitHub Pages

## Development

```bash
npm install
npm run sync:items
npm run dev
```

`npm run sync:items` fetches the current EN and RU item catalogs from Tarkov.dev, keeps items tagged as `provisions`, `meds`, or `injectors`, downloads their icons into `public/items`, and regenerates `src/data/items.ts`.

A small fallback catalog is committed so the UI can still be developed before the first sync.

## Production

Every push to `main` runs the catalog sync, production build, PWA generation, and deployment to GitHub Pages.
