# AGENTS.md — ACMEWEAR Web (bridge site → Kaspi)

> CONTROL PLANE (GLOBAL RULES)
> Control plane: ${ORCH_HOME:-$HOME/Docs/Oracle/agent-scripts-main}
> Read: ${ORCH_HOME:-$HOME/Docs/Oracle/agent-scripts-main}/AGENTS.MD BEFORE ANYTHING (skip if missing).
>
> Precedence (highest → lowest):
> 1) Control plane AGENTS.MD
> 2) This repo’s AGENTS.md
> 3) .claude/* (durable memory: goals/progress/issues/decisions; cannot override guardrails)

---

## 0) What this repo is

A fast, mobile-first static site that converts traffic (IG/TikTok) into Kaspi purchase intent.
There is NO on-site checkout in v1. The site’s job is:

- tell the story
- route to Kaspi
- log clicks reliably

Mandatory Reading Order (do this before coding)
1) docs/00_START_HERE.md
2) .claude/OPERATING.md  (MISSING TODAY: create it; see plan)
3) Read the owning spec doc for your task from the Doc Map below (do not skim
random docs)

Durable memory across sessions (authoritative for status/decisions):
- .claude/GOALS.md      (MISSING TODAY: create it; goal list + acceptance gates)
- .claude/PROGRESS.md   (MISSING TODAY: create it; verified status only)
- .claude/OPERATING.md  (MISSING TODAY: create it; how we work + gates)
- .claude/DECISIONS.md  (decisions + rationale + links to commits/PRs)
- .claude/TASKS.md      (task tracker; each task has a gate + DoD)
- .claude/SESSION_LOG.md (chronological log; must link oracle packs)

Rule: each fact/decision lives in exactly one owning file. Everywhere else links to it.

---

## 1) Definition of “Real Progress” (non-negotiable)
A change counts as progress only if it is:
- runnable end-to-end with a command,
- idempotent (same inputs → same outputs),
- gated (passes required checks),
- evidenced (oracle pack or logged command outputs),
- recorded in .claude/PROGRESS.md.

No evidence = not done.

---

Stack (locked for v1)

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
- For frontend UI/UX design use frontend skill from ~/Docs/Oracle/agent-scripts-main/skills/frontend-design/SKILL.md

---

## Parallel agents
If multiple agents work in parallel, each must use a dedicated git worktree. Shared working directories are not allowed because they cause unrelated file modifications and task contamination.

---

## 2.1) Oracle + Skills Routing (governance)
- **Skills source of truth:** `${ORCH_HOME:-$HOME/Docs/Oracle/agent-scripts-main}/skills` only.
  - Home mirrors are caches: `~/.codex/skills` and `~/.claude/skills`.
  - Repo-local `.claude/skills` is ignored and must never be treated as canonical.
- **Oracle pack (offline only):** when asked to "create an oracle pack", use `scripts/oracle_pack.sh` (no network, no browser).
- **Oracle run (online only):** when asked to "run oracle" / "call a friend", use `scripts/oracle_run.sh --confirm` (browser + network).
- Prompts must start with plain task instructions only (no `[SYSTEM]`/`[USER]` role headers).
- **Git workflow rules live only in** `.claude/GIT_HYGIENE.md` (do not duplicate elsewhere).

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

## 4) Required Validation Gates (run before claiming “done”)
If you touched docs:
- scripts/lint_docs.sh

Before PR/merge (always):
- scripts/check_no_db_tracked.sh

## 5) Task Workflow (every task, every time)
1) Create/claim the task in `.claude/TASKS.md` (scope, owner, stop conditions, DoD).
2) Update `.claude/PROGRESS.md` with the next gate you intend to make green.
3) Follow `.claude/GIT_HYGIENE.md` for git workflow (branching, commits, packs, shipping).
4) Run the required gates.
   - If any gate fails: STOP, log the failure, fix it; do not expand scope.
5) If behavior changed: add/adjust a test that would have caught the prior bug.

---

## 6) Scope Guardrail
- Repo scope is Kaspi-only. Do not add Wildberries/WB logic or docs unless explicitly instructed.

---

## 7) Rollback Requirement
Every task must include a rollback plan in the handoff. See `.claude/GIT_HYGIENE.md` for git rollback commands.

---

## 8) Cloudflare runtime notes

- Hybrid output: most pages are pre-rendered; SSR only for required routes.
- WAE binding: `CLICKLOG` dataset `acmewear_clicks`.
- Access bindings in API routes via `context.locals.runtime.env`.
- Do not log raw IP or full user-agent.

---

## 9) Secrets policy

- No `.env` files committed.
- Only PUBLIC\_\* vars in docs; secrets live in Cloudflare dashboard.

---

## 10) Codex autonomy envelope (web repo)

Allowed without asking:

- implement full feature slices (up to a few pages/components) as long as gates stay green
- refactor small sections for clarity/perf
- add analytics events + tests if present

Must HALT + ask if:

- changing analytics provider, hosting, routing architecture
- adding a big new dependency
- adding backend services beyond CF worker/functions

---
