# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Personal portfolio of Kayro Gomes — **Next.js 16 (App Router) + React 19 + Payload CMS 3**, with Payload running **in the same Next process**. Postgres (Docker locally, Neon in prod), Vercel Blob for media, deployed on Vercel. Package manager is **Bun 1.3.x** (`bun` / `bunx`, not npm/pnpm).

## Read these first

- **`AGENTS.md`** — authoritative git/deploy workflow, environment matrix, and the **AI safety rules** (warn before migrations, direct commits to `main`, destructive ops, seed in prod). It also documents the **HighImpact hero layout geometry**, whose CSS is deliberately calibrated — do not change classes in `src/heros/HighImpact/index.tsx` without reading that section.
- `docs/MIGRATIONS.md` — migration flow and DB architecture.
- `docs/TROUBLESHOOTING.md` — catalog of common errors.

## Commands

```bash
bun dev                      # dev server on :3000 (predev: design:build + ensure-db.sh)
docker compose up -d         # local Postgres (port 54320, uses .env.docker NOT .env.local)
bun run build                # prod build (prebuild: design:build + payload migrate; postbuild: sitemap)

bun run lint                 # ESLint, --max-warnings 0 (lint:fix to autofix)
bunx tsc --noEmit            # typecheck (separate step — build does not typecheck)
bun run test                 # test:int then test:e2e
bun run test:int             # Vitest integration (tests/int/**/*.int.spec.ts, jsdom)
bun run test:e2e             # Playwright E2E (tests/e2e; auto-starts `bun dev`)
```

Run a single test:

```bash
bun run test:int tests/int/api.int.spec.ts -t "test name substring"
bun run test:e2e tests/e2e/admin.e2e.spec.ts -g "test name substring"
```

Payload & data:

```bash
bun payload migrate          # apply migrations
bun payload migrate:create   # create a new migration (after schema changes)
bun generate:types           # regenerate src/payload-types.ts (after schema changes)
bun generate:importmap       # regenerate admin importMap
bun db:seed                  # DESTRUCTIVE — wipes Pages/Posts/Projects/Media/etc. Never in prod.
bun db:check                 # inspect DB state
```

Design tokens:

```bash
bun run design:build         # tokens/*.json → tokens.css + motion.generated.ts
bun run design:check         # CI guard: fails if generated files are stale
```

## Architecture

**Route groups** (`src/app/`):
- `(frontend)/` — public site. `[slug]` = Pages, `posts/`, `projetos/`, `search/`, sitemaps, `next/{preview,exit-preview,seed}`.
- `(payload)/` — Payload admin (`/admin`) + REST/GraphQL API (`/api/...`). Generated/owned by Payload; rarely edited by hand.

**Payload config** (`src/payload.config.ts`) is the hub: collections (`Pages`, `Posts`, `Projects`, `Media`, `Categories`, `Users`, plus a `folders` collection), globals (`Header`, `Footer`), the Lexical editor (`src/fields/defaultLexical`), the `vercelPostgresAdapter` (auto-falls back to plain pg for localhost URLs), and plugins in `src/plugins/`. Vercel Blob storage is enabled **only** when `BLOB_READ_WRITE_TOKEN` starts with `vercel_blob_rw_`.

**Page rendering is block-driven.** Pages store a `layout` array of blocks and a `hero`:
- `src/blocks/RenderBlocks.tsx` maps `blockType` → component (`archive`, `content`, `cta`, `formBlock`, `mediaBlock`). To add a block: create it under `src/blocks/<Name>/`, register its config on the collection, and add the mapping here.
- `src/heros/RenderHero.tsx` maps `hero.type` → `HighImpact`/`MediumImpact`/`LowImpact`. `PostHero`/`ProjectHero` are used by those collections' detail pages.

**`src/payload-types.ts` is generated** from collection schemas — never edit it. After changing any field/collection: `bun generate:types`, then `bun payload migrate:create` for the DB change. Migrations live in `src/migrations/`; **never edit an applied migration**. `prebuild` runs `payload migrate` automatically in CI/prod.

**Access control** is centralized in `src/access/` (`anyone`, `authenticated`, `authenticatedOrPublished`) — reuse these on collections rather than inlining functions.

**Path aliases:** `@/*` → `src/*`, `@payload-config` → `src/payload.config.ts`.

## Design system

Tokens are authored in **`src/design-system/tokens/*.json`** (DTCG format — the source of truth) and compiled by **`scripts/build-tokens.ts`** into `src/design-system/tokens.css` and `tokens/motion.generated.ts`. **Never hand-edit `tokens.css` or `motion.generated.ts`** — change the JSON and run `bun run design:build`.

- **Tailwind v4 is CSS-first**: the `@theme inline` mapping (`--color-*`, `--text-*`, `--font-*`, `--ease-*`, …) lives in the generated `tokens.css`, not in a JS config. `tailwind.config.mjs` exists **only** to configure the `@tailwindcss/typography` `prose` plugin (CMS rich text). It must reference CSS vars (`var(--text-scale-*)`), never the internal shape of `typography.json` — coupling JS to the JSON shape has broken the build before.
- `--font-sans`/`--font-mono` (Google Sans Flex/Code) are owned by `next/font` and set as the `<html>` className; typography tokens point at them via `var()`. Don't redefine them as literals.
- Framer Motion easing/duration constants come from `motion.generated.ts` (via `@/design-system/tokens/motion`) — don't hardcode bezier curves.

## Workflow essentials (see AGENTS.md for the full version)

- Branches: `main` (protected, **PR-only**, → production), `develop` (direct commits, main working branch), `preview` (direct commits, temporary Vercel deploys). Vercel auto-deploys only `main` and `preview`.
- Conventional Commits (`feat(scope):`, `fix(scope):`, `chore(scope):`, …).
- CI (`.github/workflows/ci.yml`) gates on lint → typecheck → integration tests → build (E2E runs on PRs, non-blocking).
- Never commit `.env.local` / `.env.docker` / any secrets; regenerate local env with `vercel env pull`.
