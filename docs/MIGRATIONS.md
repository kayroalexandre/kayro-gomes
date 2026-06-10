# Migrations e Banco de Dados — Guia Completo

> **Objetivo:** Explicar como funciona o fluxo de migrations no Payload CMS,
> como evitar redeploys desnecessários, e como manter o banco local (Docker)
> sincronizado com o banco de produção (Neon) sem riscos.

---

## Arquitetura de Bancos

| Ambiente | Banco | Host | Conexão | Finalidade |
|----------|-------|------|---------|------------|
| **Local (dev)** | Docker Postgres 16 | `localhost:54320` | `.env.local` | Desenvolvimento diário, testes, seed |
| **Produção** | Neon Postgres | `ep-*.neon.tech` | `POSTGRES_URL` (Vercel env) | Deploy real via `main` |

**Regra:** Nunca misture conexões. O `.env.local` aponta para Docker local.
O deploy na Vercel usa `POSTGRES_URL` do Neon (configurado em Vercel Project Settings).

---

## Como o Payload CMS Funciona com Migrations

1. **Migrations são a fonte de verdade** do schema do banco de dados.
2. Cada migration é um par de arquivos em `src/migrations/`:
   - `YYYYMMDD_HHMMSS_nome.ts` — código TypeScript executável
   - `YYYYMMDD_HHMMSS_nome.json` — snapshot do schema (para diff)
3. **NUNCA** edite uma migration já aplicada.
4. Para criar nova migration: `pnpm payload migrate:create`
5. Para aplicar: `pnpm payload migrate`
6. Para ver status: `pnpm payload migrate:status`

---

## Fluxo Recomendado (Sem Redeploys Desnecessários)

### Cenário 1: Mudanças SEM alteração de schema (mais comum)

**Exemplos de mudanças que NÃO exigem migration:**

- Alterar textos, layout, componentes React
- Adicionar lógica de negócio, validações customizadas
- Mudar queries, endpoints, ou lógica de `access control`
- Ajustar SEO, redirects, ou configurações de plugins
- Modificar componentes de admin ou frontend

**Fluxo:**

```bash
# 1. Faça mudanças no código normalmente
# 2. Teste localmente (usa Docker Postgres via .env.local)
pnpm dev

# 3. Commit direto em develop (automático por task)
git checkout develop
git add .
git commit -m "feat: minha mudança sem schema"
git push origin develop

# 4. Quando quiser deploy em produção:
gh pr create --base main --head develop
# (após aprovação + CI verde)

# 5. Merge → Vercel deploy automático
#    - Usa Neon (produção)
#    - NENHUMA migration é executada
#    - Deploy rápido (~1-2 min)
```

**Resultado:** Deploy rápido, sem downtime de DB, sem risco de schema.

---

### Cenário 2: Mudanças COM alteração de schema

**Exemplos de mudanças que EXIGEM migration:**

- Adicionar/remover campo em uma collection (`Pages`, `Posts`, `Projects`, etc.)
- Criar nova collection ou global
- Mudar relations, indexes, ou constraints
- Alterar tipo de campo (ex: `text` → `richText`)
- Adicionar validações de campo que impactam o schema

**Fluxo:**

```bash
# 1. Faça mudanças no código (Payload detecta diferença de schema)
#    Exemplo: adicionar campo "category" em Projects

# 2. Crie a migration ANTES de commitar
pnpm payload migrate:create
# → Gera: src/migrations/20260609_XXXXXX_add_category_to_projects.ts
# → Gera: src/migrations/20260609_XXXXXX_add_category_to_projects.json

# 3. Revise a migration gerada (abra o arquivo .ts)
#    - Confirme que o diff está correto
#    - NUNCA edite manualmente (use o Payload para gerar)

# 4. Teste localmente (aplica no Docker Postgres)
pnpm payload migrate
pnpm dev
# → Teste a aplicação com o novo schema

# 5. Commit: código + arquivos de migration
git checkout develop
git add src/migrations/ src/collections/Projects.ts ...
git commit -m "feat(projetos): add category field with migration"
git push origin develop

# 6. Quando quiser deploy em produção:
gh pr create --base main --head develop

# 7. Merge → Vercel:
#    - prebuild hook: pnpm payload migrate (roda no Neon)
#    - Depois: pnpm build
#    - Deploy com schema atualizado

# 8. ✅ Schema sincronizado em produção
```

**Resultado:** Schema atualizado com segurança, migrations aplicadas antes do build.

---

## Comandos Essenciais

| Comando | Onde Roda | O que Faz | Quando Usar |
|---------|-----------|-----------|-------------|
| `pnpm payload migrate:create` | Local | Cria nova migration (detecta diff de schema) | Sempre que mudar schema |
| `pnpm payload migrate` | Local / CI | Aplica migrations pendentes | Antes de testar/deploy |
| `pnpm payload migrate:status` | Local / CI | Mostra migrations aplicadas vs pendentes | Antes de PR para main |
| `pnpm generate:types` | Local | Regenera `src/payload-types.ts` | Após migration ou mudança de schema |
| `pnpm generate:importmap` | Local | Regenera importMap do admin | Após adicionar plugins/coleções |

---

## Regra de Ouro

> **Se o Payload pedir para criar migration → você DEVE criar.**
>
> Se não criar:
> - O deploy pode falhar (build quebra)
> - O schema fica inconsistente entre ambientes
> - Dados podem ser perdidos ou corrompidos

---

## Sincronização Local vs Produção

### Princípio

- **Local (Docker)** → ambiente de desenvolvimento, pode ser resetado
- **Neon (produção)** → fonte de verdade, NUNCA resetar sem backup

### Como Manter Sincronizado

1. **Migrations são a fonte de verdade** — ambas as bases usam as mesmas migrations
2. **Nunca aplique migrations manualmente no Neon** — deixe o CI fazer isso
3. **Se precisar testar migration localmente:**
   ```bash
   pnpm payload migrate          # aplica no Docker
   pnpm dev                      # testa
   ```
4. **Se precisar resetar local:**
   ```bash
   docker compose down -v        # remove volume do Docker
   docker compose up -d          # recria banco limpo
   pnpm payload migrate          # aplica todas as migrations
   ```

---

## Erros Comuns e Como Evitar

| Erro | Causa | Solução |
|------|-------|---------|
| `relation "users" does not exist` | Migration não aplicada antes de testes | Rode `pnpm payload migrate` antes de `pnpm test:int` |
| Deploy falha no prebuild | Migration com erro de sintaxe | Teste localmente antes de PR |
| Schema inconsistente | Migration editada manualmente | Nunca edite migrations já geradas |
| Seed falha com "blob already exists" | Blobs duplicados no Vercel Blob | Apague blobs ou use botão do admin UI |

---

## Checklist Antes de Abrir PR para Main

```bash
# 1. Verifique migrations pendentes
pnpm payload migrate:status

# 2. Se houver pendentes, aplique e teste
pnpm payload migrate
pnpm dev

# 3. Regere tipos (se schema mudou)
pnpm generate:types

# 4. Rode lint + typecheck + tests
pnpm lint
pnpm exec tsc --noEmit
pnpm run test:int

# 5. Commit migrations + código
git add src/migrations/ ...
git commit -m "feat: minha mudança com migration"

# 6. Push e abra PR
git push origin develop
gh pr create --base main --head develop
```

---

## Resumo Visual

```
┌─────────────────────────────────────────────────────────────┐
│  CENÁRIO 1: Mudança SEM schema (mais comum)                 │
├─────────────────────────────────────────────────────────────┤
│  Código → develop (commit direto) → PR → main → Deploy      │
│           ⚡ Rápido, sem migrations                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CENÁRIO 2: Mudança COM schema                              │
├─────────────────────────────────────────────────────────────┤
│  Código + migrate:create → Teste local → Commit migration   │
│           → develop → PR → main → prebuild: migrate (Neon)  │
│           → build → Deploy com schema atualizado            │
└─────────────────────────────────────────────────────────────┘
```

---

## Referências

- [Payload Migrations Docs](https://payloadcms.com/docs/database/migrations)
- [AGENTS.md](../AGENTS.md) — Workflow Git e convenções do projeto
- `src/migrations/` — Migrations aplicadas no projeto
- `src/endpoints/seed/` — Script de seed (destrutivo, use com cuidado)
