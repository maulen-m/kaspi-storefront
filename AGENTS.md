# AGENTS.md — ACMEWEAR Web (bridge site → Kaspi)

Read orchestrator rules first:

- ORCHESTRATOR: `AGENTS.md` in the control plane (agent-scripts-main)

This file is the **local contract**: product goals + stack + gates.

---

## 0) What this repo is

A fast, mobile-first static site that converts traffic (IG/TikTok) into Kaspi purchase intent.
There is NO on-site checkout in v1. The site’s job is:

- tell the story
- route to Kaspi
- log clicks reliably

---

## 1) Stack (locked for v1)

- Astro (static-first) + TypeScript
- Hosting: Cloudflare Pages
- Redirect + click logging: `/go/...` via Cloudflare Pages Functions + WAE
- RU-first content; KZ later must be easy (no deep hardcoded strings)

---

## 2) Non‑negotiables

- Preserve existing visual language (square blocks, sharp borders, minimal).
- Performance is a feature:
  - Lighthouse >= 95 on key pages
  - LCP < 2.5s, CLS < 0.1
- Tracking is first-class:
  - every outbound Kaspi click MUST go through `/go/...` and be logged
- No hardcoded prod URLs or secrets.
  - use env vars + safe defaults + documented config
- No heavy deps “because AI suggested it”. Keep it lean.

---

## 3) Dev commands / gates (proof required)

(Adjust if package scripts differ, but keep the concept.)

- `pnpm install`
- `pnpm lint`
- `pnpm build`
- `pnpm verify` (preferred umbrella gate if available)
- `pnpm test:e2e` and `pnpm lhci` when requested

If CI exists, run the same gate locally before commit.

---

## 4) Cloudflare runtime notes

- Hybrid output: most pages are pre-rendered; SSR only for required routes.
- WAE binding: `CLICKLOG` dataset `acmewear_clicks`.
- Access bindings in API routes via `context.locals.runtime.env`.
- Do not log raw IP or full user-agent.

---

## 5) Secrets policy

- No `.env` files committed.
- Only PUBLIC_* vars in docs; secrets live in Cloudflare dashboard.

---

## 6) Codex autonomy envelope (web repo)

Allowed without asking:

- implement full feature slices (up to a few pages/components) as long as gates stay green
- refactor small sections for clarity/perf
- add analytics events + tests if present

Must HALT + ask if:

- changing analytics provider, hosting, routing architecture
- adding a big new dependency
- adding backend services beyond CF worker/functions

---

## 7) Oracle packs (how we do reviews)

Default: changed-files-only pack (range based).
Pack should include:

- `AGENTS.md`
- `package.json` + lockfile if changed
- `src/pages/**`, `src/components/**`, `src/lib/**`
- worker/functions code for `/go/...`
- any tracking/analytics config
- any docs touched

If the repo does not yet have `scripts/oracle_pack.sh`, vendor it from the orchestrator repo (see Oracle integration section in the handoff).
