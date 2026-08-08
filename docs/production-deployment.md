# Production deployment: Hostinger + Cloudflare

## SSL/TLS

Hostinger's free SSL is the origin certificate. In Cloudflare set:

- SSL/TLS encryption mode: **Full (strict)**
- Always Use HTTPS: **On**
- Minimum TLS version: **TLS 1.2**
- Automatic HTTPS Rewrites: **On**
- Do not use Flexible mode; it leaves the Cloudflare-to-Hostinger hop unencrypted.

The origin `.htaccess` sends HSTS after deployment. Confirm HTTPS works on the
apex and `www` host before enabling HSTS in Cloudflare. Do not enable HSTS
preload until every intended subdomain is permanently HTTPS capable.

## Cloudflare cache rules

Create the rules in this order:

1. **Bypass API**
   - Expression: `starts_with(http.request.uri.path, "/api/")`
   - Cache eligibility: Bypass cache

2. **Cache static HTML at the edge**
   - Match GET/HEAD requests outside `/api/`
   - Cache eligibility: Eligible for cache
   - Edge TTL: 1 hour initially; increase to 4 hours after validation
   - Browser TTL: Respect existing headers

Hashed Astro assets can remain cached for one year. Public product images use
a seven-day browser cache because their filenames are stable rather than
content-hashed.

Purge Cloudflare cache after every production deployment. Never cache POST,
OPTIONS, `/api/*`, or error responses.

## Post-deploy checks

- `/`, `/es/`, `/ar/` return 200 over HTTPS.
- `/404.html`, `/es/404/`, and `/ar/404/` render in the expected language.
- `robots.txt`, `sitemap.xml`, and sitemap children return 200.
- Old EN/ES/AR blog URLs return a single 301 to the localized destination.
- `/api/inquiry.php` accepts same-origin POST, rejects foreign Origin, and is
  never served from cache.
- Response headers include HSTS, CSP, nosniff, Referrer-Policy, and
  Permissions-Policy.
- Submit one real inquiry with a small allowed attachment and confirm delivery.
