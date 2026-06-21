---
name: testing-kayro-gomes-local
description: Test the Kayro Gomes Next.js/Payload app locally, including debug launches and homepage smoke checks.
---

## Devin Secrets Needed

- None for local homepage/debug smoke testing.
- For admin, Vercel, Neon, or Blob workflows, use repo/project-managed secrets rather than real production values in files.

## Local setup

1. Use Node 24 and pnpm 10.33.0.
2. Install dependencies with `pnpm install --frozen-lockfile`.
3. For local app testing, create local-only `.env.local`/`.env.docker` values and start Postgres with `docker compose up -d`. Do not commit these env files.
4. If Payload regenerates `src/app/(payload)/admin/importMap.js` during a dev-server run, inspect the diff before committing; it might be a generated local side effect unrelated to the test.

## Runtime checks

- Normal development: `pnpm dev`.
- VS Code full-stack debug source-map checks: run the launch-equivalent command from repo root, `node --inspect node_modules/next/dist/bin/next dev --webpack`.
- A successful webpack debug launch should print `Next.js 16.2.7 (webpack)`, `Debugger port:`, and `✓ Ready`.
- To confirm the Turbopack HMR source-map path is bypassed, clean `.next`, load `/`, then check that `.next/dev` contains no files matching `*turbopack*` or `*hmr-client*`.

## Useful assertions

- `http://localhost:3000/` should render the public Kayro Gomes page and the server log should include `GET / 200`.
- The debug/source-map regression should be considered present if logs include `Could not read source map`, `hmr-client.ts`, or `Unexpected token` after launching the debug configuration.
