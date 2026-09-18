# kaspi-storefront

A brand storefront that exists to send measured traffic somewhere else.

In Kazakhstan the checkout that converts is [Kaspi](https://kaspi.kz) — buyers
trust it, it holds the payment methods, and it owns the delivery. So the brand
site does not try to be the checkout. It is a fast, credible bridge:
Instagram/TikTok ad → brand site → attributed click-out → Kaspi listing.

Astro 4, deployed on Cloudflare Workers. Sanitized public synthesis of a live
apparel storefront.

---

## The interesting part: attribution across a handoff

The hard problem is that the sale completes on a domain you do not control and
get no callback from. You cannot track the conversion, so you track everything
up to the handoff and make that boundary measurable.

Every Kaspi CTA routes through `/go/kaspi/[slug]`
(`src/pages/go/kaspi/[slug].ts`), which:

1. resolves the target Kaspi URL for that product slug (`src/lib/kaspi.ts`),
2. builds an attribution snapshot from the visitor's first-touch params —
   `utm_*`, `fbclid`, `ttclid`, `gclid` and an internal campaign id
   (`src/lib/attribution.ts`),
3. mints a click id, classifies the device,
4. writes the event to Cloudflare Workers Analytics Engine,
5. issues a 302.

The click-out becomes the conversion event. Ad spend gets attributed against a
measurable point instead of a guess, and the redirect is edge-side so it costs
the visitor nothing.

## Config-driven campaign landers

Marketing ships a lander by adding a JSON file, not by opening a PR against
components:

```
src/content/landers/<campaign>.json   ->   /l/<campaign>
```

`src/pages/l/[campaign].astro` resolves them through `getStaticPaths`.
Same for the catalog: `src/data/products.json` drives `/p/[slug]`, the shop
index and the product cards.

## Layout

```
src/pages/          routes — home, shop, /p/[slug], /l/[campaign], /go/kaspi/[slug]
src/lib/            kaspi url resolution, attribution, site config, formatting
src/components/     ProductCard and friends
src/content/        lander definitions
src/data/           product catalog
policies/           terms, privacy, shipping-returns, payment
tests/              vitest unit + Playwright e2e
```

## Verification gate

```bash
pnpm install
pnpm dev

pnpm verify      # lint + format + typecheck + vitest + build — all of it
pnpm test:e2e    # Playwright
pnpm lhci        # Lighthouse CI budgets (lighthouserc.json)
pnpm preview     # production-like via wrangler
```

`pnpm verify` is the single gate; nothing ships that does not pass it. The
Lighthouse budgets are enforced because the traffic is mobile and paid — a slow
page is money burned before the visitor sees the product.

## What is not in this repo

Product photography and brand assets, the `.claude/` working-state files, and
build output. Brand and SKU identifiers are placeholders (`ACMEWEAR`, `LINE51`,
`LINE61`); `src/data/products.json` carries the real schema with neutral values.

## Provenance

38 commits with their original January 2026 author dates; the `store-ui` and
`design-exploration` branches are consolidated into `main`.

## License

MIT — see [LICENSE](LICENSE).
