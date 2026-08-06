## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Project rules

- **No React.** UI is Astro + vanilla JS only.
- **Content source of truth:** `src/content/**/{en,es,ar}/*.mdx`. Sync JSON with `npm run sync:content`.
- **Locales:** `en` unprefixed; `es` → `/es/`; `ar` → `/ar/` with `dir="rtl"`. UI strings in `src/i18n/ui/`.
- Prefer idiomatic localized copy over literal English calques when editing `es` / `ar` MDX.
- PHP inquiry backend: `public/api/*.php` — keep FormData-compatible with `src/lib/inquiry.ts`.

## Documentation

- Site spec: `docs/coolerfit-site-spec.md`
- Astro: https://docs.astro.build
- Content collections: https://docs.astro.build/en/guides/content-collections/
- i18n: https://docs.astro.build/en/guides/internationalization/
