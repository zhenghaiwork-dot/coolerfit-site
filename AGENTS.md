## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Project rules

- **No React.** UI is Astro + vanilla JS only.
- **Content source of truth:** `src/content/**/{en,es,ar}/*.mdx`. Sync JSON with `npm run sync:content`.
- **Locales:** `en` unprefixed; `es` → `/es/` (**Mexico** Spanish); `ar` → `/ar/` (**Gulf** pan-Arabic, RTL). See `docs/i18n-markets.md`.
- Prefer idiomatic localized copy over literal English calques. ES lead term: *funda para enfriador evaporativo*. AR lead term: *كفر/غطاء مكيف صحراوي*.
- PHP inquiry backend: `public/api/*.php` — keep FormData-compatible with `src/lib/inquiry.ts`.

## Documentation

- Site spec: `docs/coolerfit-site-spec.md`
- Astro: https://docs.astro.build
- Content collections: https://docs.astro.build/en/guides/content-collections/
- i18n: https://docs.astro.build/en/guides/internationalization/
