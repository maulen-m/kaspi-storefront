# ACMEWEAR Bridge Site — Execution Plan (Kaspi-first, ultra-fast)

## 0) Mission

Build a premium-feeling, ultra-fast website whose primary job is:
IG/TikTok traffic → ACMEWEAR site → measured click-out → Kaspi product/store page.

Secondary job:
Answer trust questions (size, delivery/returns, authenticity, contacts) with minimal UX clutter.

## 1) Non-goals (v1)

- No on-site checkout, cart, or payments.
- No “full ecommerce stack” (Next.js + Postgres) unless explicitly re-scoped later.
- No visual redesign (keep square-window aesthetic, borders, spacing language).

## 2) Hard constraints

- Preserve existing look/feel (square blocks, high-contrast borders, minimalism).
- Mobile-first performance targets:
  - Lighthouse Performance >= 95 (key pages)
  - LCP < 2.5s (mid-tier Android / 4G)
  - CLS < 0.1
- Tracking is first-class: every Kaspi click is attributable and measurable.
- Dev workflow:
  - atomic commits
  - validations/tests
  - clear rollback path
  - reproducible builds
  - Oracle packs (repomix replacement)

## 3) Tech decisions (locked for v1)

- Framework: Astro (static-first) + TypeScript
- Hosting: Cloudflare Pages
- Redirect + server-side event logging: Cloudflare Worker (or Pages Functions)
- Package manager: pnpm (commit pnpm-lock.yaml)
- CI: GitHub Actions (lint, format, typecheck, build, smoke tests, Lighthouse CI)

Rationale:
Static-first minimizes JS, maximizes speed, reduces scope, keeps UX premium.

## 4) Repo baseline assumptions

- Repo name/path target: acmewear_web
- Legacy static HTML/CSS/JS exists and is reference only.
- Legacy cart/checkout pages exist but must NOT remain as promoted flows.

If repo was already cloned/renamed manually, skip “M0.0”.

---

# Milestones (steipete-style: small steps + validations + atomic commits)

## M0 — Repo operations + tooling scaffold

### M0.0 (optional) Clone/rename

Commands (if NOT already done):

- cp -R ACMEWEAR_website_static_Gem acmewear_web
- cd acmewear_web
- (choose) keep git history OR re-init clean history

Acceptance:

- Repo opens cleanly
- `git status` is sane

### M0.1 Tooling + scripts

Tasks:

- Add Node version pin: `.nvmrc` (or `.tool-versions`)
- Enable corepack and pnpm
- Create Astro project in-repo (no separate folder)
- Add scripts:
  - `pnpm dev`
  - `pnpm build`
  - `pnpm preview`
  - `pnpm lint`
  - `pnpm format`
  - `pnpm typecheck`
  - `pnpm test` (minimal)
  - `pnpm verify` (runs lint+typecheck+test+build)
- Add ESLint + Prettier config
- Add basic Vitest (only for small utilities; keep it lean)

Atomic commits (suggested):

1. chore: add pnpm + node version pin
2. chore: scaffold astro + ts + base scripts
3. chore: add lint/format/typecheck/verify

Validation checklist:

- pnpm install
- pnpm verify

---

## M1 — Visual preservation port (NO redesign)

Tasks:

- Keep existing CSS visual identity:
  - move legacy `assets/` into `public/assets/` (so URLs remain `/assets/...`)
  - reference CSS from layout: `<link rel="stylesheet" href="/assets/css/styles.css">`
- Create `src/layouts/BaseLayout.astro` and implement:
  - header/nav
  - footer
  - “square window” container layout
- Pages (RU-first):
  - `/` (landing)
  - `/shop` (grid shell, no data yet)
  - `/contact`
  - `/size-guide`
  - `/delivery-returns`
  - `/faq`
  - `/policies/*` minimal pages

Acceptance:

- Pages render with preserved aesthetic
- No CLS jumps on load (reserve space; set image dimensions)
- No client-side JS required for above-the-fold

Atomic commits:

- feat: add base layout + preserved css
- feat: add core pages shells

Validation:

- pnpm verify
- Manual: open /, /shop, /contact on mobile viewport

---

## M2 — Product content model + static generation

Tasks:

- Create `src/content/products.json` as single source of truth.
  Fields (minimum):
  - id, slug, title_ru, category, images[], bullets_ru[], sizes[], kaspi_url
    Optional:
  - price_kzt (only if trustworthy)
  - flags: featured/new/bestseller
- Generate:
  - `/shop` grid from products.json
  - `/p/[slug]` product pages (static)
- CTA rule:
  - every product card: “Купить в Kaspi”
  - every product page: prominent CTA + sticky bottom CTA on mobile

Acceptance:

- Product pages build statically (no runtime fetch)
- 0 console errors
- CTA exists and uses redirect path `/go/kaspi/<slug>`

Atomic commits:

- feat: add products content model
- feat: generate shop + product pages

Validation:

- pnpm verify
- Confirm /p/<slug> renders with images and CTA

---

## M3 — Attribution backbone: first-party redirect + click logging

Tasks:

- Implement `/go/kaspi/[slug]` endpoint (Worker or Pages Function):
  - Resolve slug -> kaspi_url (load products.json at build or embed mapping)
  - Read inbound attribution (UTMs + fbclid + ttclid + gclid + of_cid)
  - Log server-side event (start with structured logs; then GA4 MP)
  - 302 redirect to kaspi_url
- Add client attribution capture:
  - on landing: capture UTMs + click IDs + generate of_cid (uuid)
  - persist in localStorage (and optionally a cookie)
- Ensure all Kaspi CTAs use `/go/...` (never direct Kaspi URLs)

Acceptance:

- Clicking CTA always triggers redirect and logs event
- Redirect is fast (edge)
- Works even if pixels blocked

Atomic commits:

- feat: add go redirect endpoint + logging
- feat: add attribution capture + link decorator

Validation:

- pnpm verify
- Manual: click CTA; confirm redirect works and logs contain expected payload

---

## M4 — Workflow acceleration + Oracle/repomix (UV method)

Tasks:

- Add cross-platform runners:
  - `scripts/dev.sh` (fast-path install + pnpm dev)
  - `scripts/preview.sh` (pnpm build + pnpm preview)
  - `scripts/verify.sh` (pnpm verify)
- Add double-click launchers (macOS):
  - `tools/ACMEWEAR_DEV.command`
  - `tools/ACMEWEAR_PREVIEW.command`
  - `tools/ACMEWEAR_VERIFY.command`
- Adopt Oracle pack workflow:
  - `scripts/oracle_pack.sh` aligned with Autonomous_business logic
  - output: `~/Docs/Oracle/<project>/<YYYY-MM-DD>/<HHMMSS>_<TASK>.md` (project defaults to repo folder name)
- Repomix XML double-click:
  - `~/Docs/Oracle/acmewear_web/repomix_acmewear_web.command`
  - output XML copied into `~/Docs/Oracle/acmewear_web/<YYYY-MM-DD>/`

UV method:

- Always keep an undo command ready (git restore) + run `pnpm verify` before sharing.

Acceptance:

- One-click scripts are executable and documented here.
- Oracle pack uses denylist (no secrets, no node_modules, no build artifacts).
- Repomix command runs and writes XML into the date folder.

Atomic commits:

- chore: add workflow runners + commands
- chore: align oracle pack script + repomix command

Validation:

- pnpm verify

---

## M5 — Analytics + pixels (performance-safe)

Tasks:

- Implement event schema:
  - page_view (auto)
  - view_item, view_item_list
  - cta_click_to_kaspi (include placement + slug + of_cid)
  - scroll_depth (25/50/75/90)
  - contact_click_whatsapp / contact_click_call
- GA4:
  - start with gtag (avoid GTM unless required)
- Meta + TikTok pixels:
  - load only after consent (if you add consent)
  - defer until after first paint / idle
- Optional: GA4 Measurement Protocol from Worker for server-side “cta_click_to_kaspi”

Acceptance:

- Events fire once (no duplicates)
- Lighthouse remains >=95 with pixels deferred

Atomic commits:

- feat: add analytics events + schema
- feat: add pixels (deferred + gated)

Validation:

- pnpm verify
- Lighthouse CI pass on key pages

---

## M6 — Performance hardening (budgets enforced)

Budgets:

- Site JS (excluding 3p): <= 25 KB gz
- CSS: <= 50 KB gz
- Fonts: self-host 1 family, 1–2 files, preload, font-display: swap
- Images:
  - hero <= 150 KB (avif/webp)
  - product card <= 60 KB
- Requests: keep lean; no random libraries

Tasks:

- Self-host fonts (subset if possible)
- Add image optimization strategy (astro assets)
- Add Lighthouse CI with thresholds
- Add Playwright smoke tests for:
  - key routes load
  - CTA present
  - no console errors

Acceptance:

- Lighthouse >=95 (/, /shop, /p/sample)
- LCP/CLS in targets on throttled runs

---

## M7 — Deploy + rollback

Tasks:

- Deploy to Cloudflare Pages (preview + prod)
- Domain config + SSL
- Ensure canonical + sitemap are correct
- Add basic uptime monitoring if desired

Acceptance:

- Reproducible build in CI
- Rollback = redeploy previous build

---

## M8 — Campaign landers

Tasks:

- Add `/l/[campaign]` template driven by `src/content/landers.json`
- Ensure UTMs persist and click-outs are logged with campaign context

Acceptance:

- New lander can be shipped via editing JSON + deploy

---

# Oracle Packs (repomix replacement)

## Goal

Generate small, curated context packs that agents can fully load.

## Pack contents (minimum)

- AGENTS.md
- docs/PLAN.md
- src/pages/\*\* (key routes)
- src/lib/\*\* (tracking + attribution)
- src/content/\*\*
- functions/\*\* or worker code
- package.json + pnpm-lock.yaml
- CI workflow file
- README with commands

## Naming convention

oracle*packs/oracle*<YYYY-MM-DD>_<milestone>_<shortdesc>.md

## When to generate

- before a Codex run
- after completing a milestone
- before deployment
