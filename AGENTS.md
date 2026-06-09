# AGENTS.md — Kayro Gomes (Portfólio)

> **⚠️ CONSOLIDAÇÃO REALIZADA (2026-06-08):** O projeto foi consolidado
> de volta a uma única fonte de verdade (`main`). Branches antigas
> (`develop`, `fix/docker-standalone-build`, `feature/turbopack-migration`,
> worktree `glorious-scribe`) foram removidas. `.env.local` agora aponta
> para **Postgres via Docker Compose** (porta 54320) para evitar push
> acidental no Neon de produção. Backup completo salvo em
> `.env.local.backup-neon-prod`. Consulte o histórico de commits e
> `backup/docker-standalone-build` se precisar recuperar algo.

Este arquivo documenta o **workflow oficial** de desenvolvimento, deploy
e operações do projeto. Toda IA (Kilo, GitHub Copilot, etc.) e todo
contribuidor humano deve seguir estas convenções.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **Payload CMS 3** (rodando no mesmo processo Next)
- **Postgres** (Neon em prod/preview; Docker local)
- **Vercel Blob Storage** para mídia
- **Vercel** para deploy (Production + Preview)
- **GitHub Actions** para CI

## Ambientes

| Ambiente    | Branch        | URL                                           | Banco                | Cron  |
|-------------|---------------|-----------------------------------------------|----------------------|-------|
| Production  | `main`        | https://www.kayrogomes.com                    | Neon `main` branch   | ✅     |
| Preview     | qualquer PR   | https://kayro-gomes-<branch>.vercel.app       | Neon `preview` branch | ❌     |
| Development | local         | http://localhost:3000                         | Docker `postgres:16` | ❌     |

### Onde cada config vive

- **Production / Preview env vars:** Vercel Project Settings → Environments.
  Nunca commitar valores reais.
- **Local dev env vars:** `.env.local`, regenerado com `vercel env pull`.
- **Local Postgres:** `docker compose up -d` (usa `.env.docker`, não `.env.local`).

## Git Workflow

### Branches

- `main` — produção. Protegida (1 review, CI verde, linear history).
- `develop` — integração contínua.
- `feature/*` — novas funcionalidades. Base: `develop`.
- `fix/*` — correções. Base: `develop`.
- `hotfix/*` — correções urgentes em produção. Base: `main`.
- `release/*` — preparação de releases.

### Conventional Commits

```
feat(scope): add new feature
fix(scope): fix bug
chore(scope): tooling/infra changes
refactor(scope): code refactor without behavior change
docs(scope): docs only
test(scope): add/fix tests
perf(scope): performance improvement
ci(scope): CI/CD changes
style(scope): formatting only
```

Exemplos:
- `feat(projetos): add category filter`
- `fix(seed): serialize media uploads`
- `chore(ci): add lint workflow`

### Fluxo

1. Crie branch: `git checkout develop && git pull && git checkout -b feature/minha-feature`
2. Faça commits usando Conventional Commits.
3. Abra PR para `develop` (ou `main` em hotfix).
4. CI roda lint + typecheck + tests + build.
5. Vercel gera Preview deployment automático.
6. Reviewer aprova.
7. Merge (squash) → Vercel rebuilda.

## Comandos Locais

```bash
# Setup
vercel link                       # linkar projeto Vercel
vercel env pull                   # baixar .env.local

# Dev
pnpm dev                          # dev server (port 3000)
docker compose up -d              # Postgres local
pnpm payload migrate              # rodar migrations
pnpm generate:types               # regenerar tipos Payload
pnpm generate:importmap           # regenerar importMap admin

# Quality
pnpm lint                         # ESLint
pnpm exec tsc --noEmit            # Typecheck
pnpm run test:int                 # Integration tests (Vitest)
pnpm run test:e2e                 # E2E tests (Playwright)
pnpm build                        # Production build
```

## Neon Branches

Cada PR/branch na Vercel que dispara um deploy **deveria** apontar
para uma Neon branch dedicada. Como o projeto usa Postgres shared
na Vercel por enquanto, monitore o impacto e evolua para Neon
branching quando o tráfego justificar.

## Migrations

- Migrations ficam em `src/migrations/`.
- **NUNCA** edite uma migration já aplicada.
- Crie nova: `pnpm payload migrate:create`.
- Em CI/prod, `pnpm build` roda `payload migrate` automaticamente (prebuild hook).

## Segurança

- **NUNCA** commite `.env.local`, `.env.docker`, ou qualquer arquivo com secrets.
- **Rotacione** todos os secrets se este repo for clonado em máquina não-trusteda.
- Use `vercel env pull` para gerar `.env.local` em qualquer máquina.
- Para Postgres local, use **apenas** `.env.docker`.
- Senha do seed demo: defina `PAYLOAD_DEMO_USER_PASSWORD` em env (nunca hardcode).

## Seeds

O seed (`pnpm db:seed` ou botão no admin) é **destrutivo** — apaga
todos os dados de Pages, Posts, Projects, Media, Forms, etc. antes
de re-popular. **Nunca rode em produção** sem backup.

## Cron Jobs

Definidos em `vercel.json`. Endpoint: `/api/payload-jobs/run`.
Autenticação via header `Authorization: Bearer $CRON_SECRET`.
- Schedule: `0 0 * * *` (diário, meia-noite UTC).

## Pendências Conhecidas

- ~~Docker build requer `DOCKER_BUILD=true pnpm build` antes de `docker build`.~~
  **Resolvido em `fix/docker-standalone-build`:** o Dockerfile agora seta
  `DOCKER_BUILD=true` internamente na fase `builder` e roda `pnpm run build`
  lá. O único comando necessário é `docker build -t kayro-gomes .`. Foi
  adicionado também um `.dockerignore` para evitar vazar `.env*`, `node_modules`
  e artefatos de teste. Veja o cabeçalho do `Dockerfile` para detalhes.
- Testes E2E não rodam no CI (lentos + requerem Vercel Preview). Rodam manualmente.
- Neon branching ainda não implementado (DB compartilhado entre Preview/Prod).
