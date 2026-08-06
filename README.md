# CoolerFit (aircoolercover.com)

Astro 7 + Tailwind CSS v4 static site. No React. Content lives in MDX Content Collections under `src/content/`.

## Local development

- Node.js **24 LTS** (engines: `>=22.12.0`)
- `npm install`
- `npm run sync:content` — regenerate `src/data/_generated/*.json` from MDX
- `npm run dev`
- `npm run build` → output in `dist/`

### Content workflow

1. Edit MDX in `src/content/{collection}/{locale}/`
2. For new locales, run `npx tsx scripts/seed-locale-content.ts` (or author MDX by hand)
3. `npm run sync:content` before build (also runs automatically via `npm run build`)

Locales: **en** (default, unprefixed), **es** (`/es/…`), **ar** (`/ar/…`, RTL).

## Hostinger Node.js Web App

1. Push this repo to GitHub.
2. In Hostinger: create a **Node.js** web app linked to the repo.
3. Set Node version to **24** (or latest LTS ≥ 22.12).
4. Build command: `npm run build`
5. Output / public directory: `dist` (or map `dist` → `public_html` per Hostinger UI).
6. Ensure PHP API files from `public/api/` are deployed alongside static HTML (they copy into `dist/api/` on build).
7. Keep `dist/.htaccess` (from `public/.htaccess`) for blog 301s, caching, and `ErrorDocument 404 /404.html`.
8. Configure `PUBLIC_INQUIRY_ENDPOINT` if the inquiry URL is not `/api/inquiry.php`.

## Key docs

- [docs/coolerfit-site-spec.md](docs/coolerfit-site-spec.md)
- [docs/product-image-shot-list.md](docs/product-image-shot-list.md)
