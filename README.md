# EFT Allergy Tracker

Mobile-first PWA companion for the seasonal **Allergic** modifier in Escape from Tarkov.

The tracker is designed for one fast raid-time action: find a provision or medical item and mark it as safe or allergic. Progress is stored locally on the device.

## Current features

- seasonal (`pvp-season`) consumable catalog synced from `json.tarkov.dev` during deployment
- provisions, medicine and injectors
- Russian / English names and instant language switching
- search across both languages
- status and category filters
- `unknown`, `safe`, `allergic` states
- allergy counter capped by the game mechanic at 3 selections
- local persistence with `localStorage`
- item icons downloaded at build time
- offline-capable PWA with the catalog and item icons included in the precache
- automatic GitHub Pages deployment

## Stack

- React
- TypeScript
- Vite
- vite-plugin-pwa / Workbox
- `json.tarkov.dev` static game-data snapshots
- localStorage
- GitHub Actions + GitHub Pages

## Catalog

The current seasonal dataset identifies allergy candidates through Tarkov item types:

- every candidate is a consumable (`provisions`)
- items additionally tagged `meds` or `injectors` are shown as **medical**
- the remaining provisions are shown as **food / drink**

The sync step also validates that both categories are present before allowing a production deployment.

## Development

```bash
npm install
npm run sync:items
npm run dev
```

`npm run sync:items` fetches the current `pvp-season` item snapshot plus EN/RU translations from `json.tarkov.dev`, builds the allergy catalog, downloads item icons into `public/items`, and regenerates `src/data/items.ts`.

A small fallback catalog is committed so the UI can still be developed before the first sync.

## Production

Every push to `main` runs the catalog sync, production build, PWA generation, and deployment to GitHub Pages.
