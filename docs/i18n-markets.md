# i18n market targets

Locked markets for CoolerFit localization:

| Locale | Primary market | Writing target | Head terms (prefer in titles / H1) |
|--------|----------------|----------------|-------------------------------------|
| `en` | United States | US English | evaporative cooler cover, swamp cooler cover |
| `es` | **Mexico** | Español de México | **funda para enfriador evaporativo**, funda para cooler, cotización |
| `ar` | **Gulf pan-Arabic** (UAE + Saudi writing) | Modern Standard Arabic, Gulf B2B tone | **كفر مكيف صحراوي** / **غطاء مكيف صحراوي**, مبرد تبخيري (formal) |

## Editorial rules

### Spanish (`es`) — Mexico

- Use *tú* / business-neutral *usted* only where B2B formality needs it; site CTAs stay *tú*-friendly (“Cotizar”, “Pedir cotización”).
- Prefer **funda** over literal *cover* / *cubre* for product naming; *protector* is secondary.
- Equipment: **enfriador evaporativo**; MX also searches **cooler** — both OK in body; titles lead with *enfriador evaporativo* when volume supports it.
- Avoid Spain-only wording (*presupuesto* for quote → use **cotización**; *aire acondicionado por evaporación* only as synonym).

### Arabic (`ar`) — Gulf

- Lead with **مكيف صحراوي** (everyday Gulf term). Use **مبرد تبخيري** in technical / SEO supporting copy.
- Cover noun: **كفر** or **غطاء** (both used; *كفر مكيف صحراوي* matches regional “protective cover” habit).
- Keep MSA grammar; Gulf business tone (clear, direct, no dialect slang in UI).
- Do not mirror English sentence structure word-for-word.

## DataForSEO

When the DataForSEO MCP credentials are valid, refresh volumes with:

- ES: `location_name: "Mexico"`, `language_code: "es"`
- AR: `location_name: "United Arab Emirates"` and `"Saudi Arabia"`, `language_code: "ar"`

Seed lists live in `scripts/keyword-seeds-mx-gulf.json`. Re-run overview + keyword ideas, then update MDX titles / H1s in `src/content/**/{es,ar}/` — never paste EN calques.

## Browser language auto-redirect

Client-side (static-hosting friendly) in `BaseLayout`:

- Reads `navigator.languages` on first visit → `es*` → `/es/…`, `ar*` → `/ar/…`, else stay on English.
- Stores preference in `coolerfit_lang` (cookie + localStorage); language switcher updates it.
- Skips known bots so crawlers keep the URL they requested (hreflang still applies).
- Escape hatch: append `?nolang=1` to skip redirect while debugging.
