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

---

## ⚠️ Instruções para IA (Kilo, Copilot, etc.)

**SEMPRE avise ANTES de executar quando o usuário pedir algo que:**

1. **Quebre o fluxo de trabalho** (ex: commit direto em `main`, deploy automático de `develop`, deploy de `preview` sem pedido explícito)
2. **Exija migration de banco** (mudança de schema em collections, relations, indexes)
3. **Possa causar conflito, erro, ou quebrar o CMS/projeto** (ex: resetar banco de produção, editar migration já aplicada, rodar seed em produção, mudar config crítica sem backup)

**NUNCA execute automaticamente nesses casos.** Em vez disso:

- Avise claramente o risco
- **Proponha uma alternativa segura** antes de qualquer ação
- Aguarde confirmação explícita do usuário

**Exemplo de resposta esperada:**
> ⚠️ Isso exige criar uma migration de banco (`bun payload migrate:create`).
> Posso:
> - (A) Criar a migration e testar localmente no Docker
> - (B) Apenas documentar a mudança sem aplicar
> Qual prefere?

---

> **Consulte também:**
>
> - [`docs/DESIGN-SYSTEM-GOVERNANCE.md`](docs/DESIGN-SYSTEM-GOVERNANCE.md) — Governança do design system (leia antes de mexer em tokens/componentes/estilo)
> - [`docs/MIGRATIONS.md`](docs/MIGRATIONS.md) — Fluxo completo de migrations e arquitetura de bancos
> - [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) — Catálogo de erros comuns e soluções
> - [`docs/workflow_guide.md`](docs/workflow_guide.md) — Guia legado (consulte AGENTS.md para o estado atual)

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
| Preview     | `preview`     | https://kayro-gomes-git-preview-....vercel.app | Neon `preview` branch | ❌     |
| Development | `develop`     | http://localhost:3000 (local)                 | Docker `postgres:16` | ❌     |

### Onde cada config vive

- **Production / Preview env vars:** Vercel Project Settings → Environments.
  Nunca commitar valores reais.
- **Local dev env vars:** `.env.local`, regenerado com `vercel env pull`.
- **Local Postgres:** `docker compose up -d` (usa `.env.docker`, não `.env.local`).

## Git Workflow (Simples — 3 Branches Permanentes)

### Branches

| Branch | Proteção | Commits diretos | Propósito |
|--------|----------|-----------------|-----------|
| `main` | ✅ Protegida | ❌ Nunca | Produção real |
| `develop` | ❌ Sem proteção | ✅ Sim | Desenvolvimento contínuo (branch de trabalho principal) |
| `preview` | ❌ Sem proteção | ✅ Sim | Deploys temporários / testes em ambiente isolado |

**Regras:**
- `main` → **só recebe merges via PR** (de `develop` ou `preview`)
- `develop` → commit direto permitido
- `preview` → commit direto permitido

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

### Fluxo Diário (Simples)

```bash
# Desenvolvimento normal (commit direto em develop)
git checkout develop && git pull origin develop
# ... fazer mudanças ...
git add . && git commit -m "feat: minha mudança"
git push origin develop

# Preview / deploy temporário (commit direto em preview)
git checkout preview && git pull origin preview
# ... fazer mudanças ...
git add . && git commit -m "chore: teste em preview"
git push origin preview
# → Vercel cria deploy temporário automaticamente

# Quando quiser subir algo pra produção (main)
# → Abre PR: develop → main  OU  preview → main
gh pr create --base main --head develop
```

### Fluxo

1. Trabalhe diretamente em `develop` ou `preview` (commits diretos)
2. Faça commits usando Conventional Commits
3. CI roda lint + typecheck + tests + build automaticamente
4. Para produção: abra PR de `develop` ou `preview` → `main`
5. Todos os 4 status checks devem passar
6. Merge (squash) → Vercel rebuilda produção

## Comandos Locais

```bash
# Setup
vercel link                       # linkar projeto Vercel
vercel env pull                   # baixar .env.local

# Dev
bun dev                           # dev server (port 3000)
docker compose up -d              # Postgres local
bun payload migrate               # rodar migrations
bun generate:types                # regenerar tipos Payload
bun generate:importmap            # regenerar importMap admin

# Quality
bun run lint                      # ESLint
bunx tsc --noEmit                 # Typecheck
bun run test:int                  # Integration tests (Vitest)
bun run test:e2e                  # E2E tests (Playwright)
bun run build                     # Production build
```

## Neon Branches

Cada PR/branch na Vercel que dispara um deploy **deveria** apontar
para uma Neon branch dedicada. Como o projeto usa Postgres shared
na Vercel por enquanto, monitore o impacto e evolua para Neon
branching quando o tráfego justificar.

## Migrations

- Migrations ficam em `src/migrations/`.
- **NUNCA** edite uma migration já aplicada.
- Crie nova: `bun payload migrate:create`.
- Em CI/prod, `bun run build` roda `payload migrate` automaticamente (prebuild hook).

## Segurança

- **NUNCA** commite `.env.local`, `.env.docker`, ou qualquer arquivo com secrets.
- **Rotacione** todos os secrets se este repo for clonado em máquina não-trusteda.
- Use `vercel env pull` para gerar `.env.local` em qualquer máquina.
- Para Postgres local, use **apenas** `.env.docker`.
- Senha do seed demo: defina `PAYLOAD_DEMO_USER_PASSWORD` em env (nunca hardcode).

## Seeds

O seed (`bun db:seed` ou botão no admin) é **destrutivo** — apaga
todos os dados de Pages, Posts, Projects, Media, Forms, etc. antes
de re-popular. **Nunca rode em produção** sem backup.

## Cron Jobs

Definidos em `vercel.json`. Endpoint: `/api/payload-jobs/run`.
Autenticação via header `Authorization: Bearer $CRON_SECRET`.
- Schedule: `0 0 * * *` (diário, meia-noite UTC).

## Frontend Architecture — Hero Layout (HighImpact)

> **⚠️ Regras críticas para IA:** As classes CSS do `HighImpactHero`
> estão **deliberadamente calibradas**. Toda margem, padding, altura e
> espaçamento têm uma função geométrica interdependente. **Não altere**
> classes CSS no componente `src/heros/HighImpact/index.tsx` sem
> entender o diagrama abaixo e sem consultar esta documentação.

### Layout Geometry (logado, AdminBar visível)

```
viewport top
├─ AdminBar ( h: var(--adminbar-h) ≈ 3rem, publicada via ResizeObserver )
│  fixed top-0 z-[9999]
├─ Header ( top: var(--adminbar-h), h: var(--header-h) = 5rem )
│  fixed top-[var(--adminbar-h)]
│
│  section: h-[calc(100dvh-var(--adminbar-h,0px))]
│  ┌─ container: mt-[var(--header-h)] ──────────────────┐
│  │  h-[calc(100%-var(--header-h))]                     │
│  │  py-16 (= 4rem each, igual top e bottom)            │
│  │  flex-col justify-between                           │
│  │                                                      │
│  │  heading ───────────────────── ← 64px abaixo header  │
│  │  [↕ gap automático = justify-between]                │
│  │  CTAs                                                │
│  │  [↕ gap automático = justify-between]                │
│  │  scroll indicator ─────────── ← 64px do viewport end │
│  └──────────────────────────────────────────────────────┘
└─ viewport bottom
```

### CSS Variables (single source of truth)

| Variável | Localização | Valor | Propósito |
|---|---|---|---|
| `--adminbar-h` | `<html>` (set via JS, AdminBar component) | `≈ 3rem` quando logado, `0px` quando não | Altura real do AdminBar, medida por `ResizeObserver`. Publicada em `src/components/AdminBar/index.tsx:71` |
| `--header-h` | `:root` em `globals.css` | `5rem` | Altura do Header. Usada pelo Header (`h-[var(--header-h)]`), pelo container do hero (`mt-[var(--header-h)]`) e pelo calc de altura do hero content |
| `--spacing` | Tailwind v4 (default theme) | `0.25rem` | Unidade base do design system. `p-16` = `calc(var(--spacing) * 16)` = `4rem` = `64px` |

### Key Design Rules

1. **Container nunca ultrapassa a hero.**
   `mt-[var(--header-h)]` (5rem) + `h-[calc(100%-var(--header-h))]` (hero - 5rem) = `100%` da section. O container não overflowa e não força a section a crescer.

2. **Padding igual (4rem top e bottom).**
   `py-16` em vez de padding assimétrico. O buffer do header (5rem) fica na **margem**, não no padding.

3. **Espaçamento entre filhos é automático.**
   `justify-between` distribui heading, CTAs e scroll indicator com gap igual. **Não use** `mt-*`/`mb-*` nos filhos — isso quebra a distribuição e força a hero a crescer.

4. **`--adminbar-h` é descontada da altura da hero.**
   A section usa `h-[calc(100dvh-var(--adminbar-h,0px))]`. Isso garante que a hero termine exatamente no final da viewport quando o AdminBar está visível.

5. **`100%` no calc do container funciona porque a section tem altura definida.**
   A section usa `h-[calc(...)]` (altura fixa), não `min-h-*`. Por isso `h-[calc(100%-var(--header-h))]` no container resolve corretamente para a altura real da section.

### Onde está o código

- `src/heros/HighImpact/index.tsx` — componente do hero
- `src/app/(frontend)/globals.css` — `:root { --header-h: 5rem; }` e tokens de cor/design system
- `src/Header/Component.client.tsx` — usa `h-[var(--header-h)]`
- `src/components/AdminBar/index.tsx` — publica `--adminbar-h` no `<html>` via ResizeObserver

### O que NÃO fazer

- ❌ **Não** colocar `mt-[var(--header-h)]` nos filhos (heading, CTAs, scroll). O margin-top do container já desloca todo o bloco.
- ❌ **Não** trocar `py-16` por `pt-[calc(...)]` assimétrico. O padding deve ser igual.
- ❌ **Não** trocar a section para `min-h-*` — `h-full` no container precisa de altura definida no pai.
- ❌ **Não** remover `justify-between` nem adicionar `mt-*`/`mb-*` nos filhos — isso quebra o espaçamento auto e faz a hero crescer.
- ❌ **Não** ignorar `--adminbar-h` no calc da section — senão o final da hero fica cortado quando logado.

---

## Pendências Conhecidas

- ~~Docker build requer `DOCKER_BUILD=true bun run build` antes de `docker build`.~~
  **Resolvido em `fix/docker-standalone-build`:** o Dockerfile agora seta
  `DOCKER_BUILD=true` internamente na fase `builder` e roda `bun run build`
  lá. O único comando necessário é `docker build -t kayro-gomes .`. Foi
  adicionado também um `.dockerignore` para evitar vazar `.env*`, `node_modules`
  e artefatos de teste. Veja o cabeçalho do `Dockerfile` para detalhes.
- ~~Testes E2E não rodam no CI (lentos + requerem Vercel Preview). Rodam manualmente.~~
  **Resolvido em auditoria 2026-06-15 (Fase 2):** job `e2e` adicionado ao
  workflow de CI. Roda apenas em PRs, com `continue-on-error: true` para
  não bloquear merges em Preview instável. Scripts de debug movidos para
  `scripts/debug/`.
- Neon branching ainda não implementado (DB compartilhado entre Preview/Prod).
  Recomendação: implementar somente após monitorar tráfego real em produção.
