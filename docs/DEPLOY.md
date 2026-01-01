# Deploy (Cloudflare Pages)

## Build & preview

- Local build: `pnpm build`
- Preview: `pnpm preview`

## Cloudflare Pages settings

- Framework preset: **Astro**
- Build command: `pnpm build`
- Build output directory: `dist`
- Node version: `20.x`

> Note: current adapter is `@astrojs/node` for local/server output.
> If you want native Cloudflare runtime, switch to the Cloudflare adapter and replace
> filesystem logging in `/go/kaspi/[slug]` with a CF-friendly target (KV, Logs, etc.).

## Environment variables (set in CF Pages)

- `PUBLIC_SITE_DOMAIN` (e.g., https://acmewear.kz)
- `PUBLIC_SUPPORT_EMAIL`
- `PUBLIC_SUPPORT_PHONE`
- `PUBLIC_WHATSAPP_NUMBER`
- `PUBLIC_KASPI_STORE_URL`
- `KASPI_STORE_URL`
- `CLICK_LOG_PATH` (optional; file path only for Node hosting)
- `PUBLIC_GA_ID` (optional)
- `PUBLIC_META_PIXEL_ID` (optional)
- `PUBLIC_TIKTOK_PIXEL_ID` (optional)
- `PUBLIC_ANALYTICS_REQUIRE_CONSENT` (optional, "1" to require consent)
- `PUBLIC_ANALYTICS_CONSENT_COOKIE` (optional; default `of_consent`)

## Domain + SSL

- Add domain in Cloudflare Pages
- Enable SSL (Full)
- Verify `robots.txt` and `sitemap.xml` reflect the production domain

## Rollback

- Use Cloudflare Pages deployments UI
- Redeploy a previous successful build

## Uptime monitoring (optional)

- Add a simple HTTP check (e.g., / and /shop) in UptimeRobot or Better Uptime
