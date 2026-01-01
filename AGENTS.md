# AGENTS.md - ACMEWEAR Website (Option C: Next.js + Postgres)
Purpose: single always-loaded brain for Codex/agents. Keep it short, factual, and operational.

## Current State (update when changed)
- Static HTML/CSS/JS storefront with placeholder content and images.
- Product catalog in assets/data/products.js; cart uses localStorage.
- Checkout is UI-only; payments/orders are not wired.
- Decision locked: migrate to Next.js (App Router) + Postgres + Prisma.

## Non-Negotiables
- Preserve the existing visual language (square blocks, minimal, black/white + accent).
- KZT only, no VAT. Do not introduce multi-currency or VAT logic.
- No destructive git ops unless explicitly instructed.
- No hardcoded secrets or production URLs; all config via env.
- Do not edit secrets or .env files without human approval.
- ~/Docs/Autonomous_business is read-only. Never modify it.
- Idempotent operations only (migrations, seeds, backfills).
- Placeholder policy must be followed (P# registry, no ad-hoc images).

## Repo Entry Points (reference + target)
- Legacy reference: index.html, shop.html, product.html, cart.html, checkout.html
- Legacy reference: assets/css/styles.css and assets/js/*
- Target app: app/ (routes, UI), app/api/ (events, orders)
- Target data: prisma/schema.prisma, prisma/migrations/
- Target config: .env (local), .env.example (tracked)
- Placeholder registry: placeholders/images.json

## Core Product Rules
- Required actions: card checkout, Kaspi payment link, Kaspi product offer link, WhatsApp, tap-to-call.
- UTM attribution must persist across sessions and be attached to orders and lead actions.
- PaymentAdapter interface must abstract the payment provider.
- All external links (Kaspi/WhatsApp/call) must be tracked as events.

## Placeholder Asset Policy (P#)
- Use P# ids only (P#1, P#2, ...), never raw image filenames.
- Registry lives at placeholders/images.json:
  - { "P#1": "public/placeholders/placeholder.svg", "P#2": null }
- If mapping is null, render a neutral placeholder image.
- Keep unspecified placeholders as-is; do not invent real URLs.

## Local Dev (target stack)
Preferred package manager: pnpm.
1) pnpm install
2) pnpm dev
3) pnpm lint
4) pnpm test (if present)

## DB + Migration Workflow (Prisma)
- Define schema in prisma/schema.prisma.
- Local: pnpm prisma migrate dev
- Prod: pnpm prisma migrate deploy
- Seed: pnpm prisma db seed (must be idempotent)
- Use deterministic ids/handles for products and SKUs.

## Default Validation
- Manual: home, shop, product, cart, checkout, order confirmation.
- Track UTMs across sessions; verify order attribution snapshot.
- Verify KZT formatting and no VAT display.
- Verify Kaspi/WhatsApp/call links + event logging.

## Definition of Done
- End-to-end flows work with KZT-only pricing and no VAT.
- Orders persist with attribution snapshot and payment intent records.
- UTM persistence works for onsite and external lead actions.
- Placeholder P# registry exists and is enforced.
- No hardcoded secrets or production URLs in code.
- SEO basics updated (title/description/canonical/sitemap/robots).

## Blast Radius Rule
- Aim for <=5 files per change. If it grows, pause and re-scope.

## Prompt Templates

### Template A - Implementation Task
- Goal:
- Constraints (visual language, no hardcoding, idempotent ops):
- Files allowed to touch:
- Validation steps:
- Done means:

### Template B - Review Request
- Context pack: changed files + screenshots if UI changes
- What changed + why:
- Evidence: manual checks or test output
- Risks/rollbacks:
