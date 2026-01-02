# ACMEWEAR Web (Kaspi-first bridge)

Premium, minimal, mobile-first storefront for **ACMEWEAR** (Kazakhstan).  
Primary job: IG/TikTok traffic → ACMEWEAR site → measured click-out → Kaspi.

## Quick start

```
pnpm install
pnpm dev
```

Key commands:

- `pnpm verify` (lint + format + typecheck + test + build)
- `pnpm test:e2e` (Playwright)
- `pnpm lhci` (Lighthouse CI)
- `pnpm preview` (prod-like)

## Product data

- Products: `src/data/products.json`
- Images: `public/assets/img/` (placeholder images stay placeholder)

## Campaign landers (M8)

Marketing can ship landers by editing config:

- `src/content/landers/*.json`
- Routes: `/l/[campaign]`

## Kaspi click logging

All Kaspi CTAs route through:

- `/go/kaspi/[slug]` → Workers Analytics Engine (WAE) → 302 to Kaspi

## Pages

- `/` (home)
- `/shop`
- `/p/[slug]`
- `/contact`
- `/size-guide`
- `/delivery-returns`
- `/faq`
- `/policies/*`

## Environment variables (Cloudflare Pages)

- `PUBLIC_SITE_DOMAIN`
- `PUBLIC_SUPPORT_EMAIL`
- `PUBLIC_SUPPORT_PHONE`
- `PUBLIC_WHATSAPP_NUMBER`
- `PUBLIC_KASPI_STORE_URL`
- `PUBLIC_GA_ID`, `PUBLIC_META_PIXEL_ID`, `PUBLIC_TIKTOK_PIXEL_ID` (optional)
- `PUBLIC_ANALYTICS_REQUIRE_CONSENT` (optional)
- `PUBLIC_ANALYTICS_CONSENT_COOKIE` (optional)

## Deploy

See `docs/DEPLOY.md` for Cloudflare Pages + Wrangler details.
