# Troubleshooting — erros "bobos" do dia a dia

Catálogo dos perrengues que aparecem (ou já apareceram) neste projeto,
com a causa raiz e a solução. Se você bateu num erro e não acha
aqui, vale rodar `pnpm db:check` antes de mais nada — ele mostra
o estado do banco e já denuncia metade dos problemas comuns.

---

## 1. Build do Vercel trava num prompt do `payload migrate`

**Sintoma:** O build do Vercel começa, fica ~10s parado, depois segue. No log aparece:

```
? It looks like you've run Payload in dev mode, meaning you've dynamically pushed changes to your database.

If you'd like to run migrations, data loss will occur. Would you like to proceed? › (y/N)
```

O deploy até termina com `● Ready`, mas o prompt polui o log e qualquer mudança estrutural no schema fica bloqueada até alguém responder.

**Causa raiz:** Alguém rodou `pnpm dev` (ou outro comando que não seja `payload migrate`) contra o banco de produção. O dev mode do payload cria um registro com `batch = -1` na tabela `payload_migrations` toda vez que altera o schema. Aí o `payload migrate` em CI detecta isso e exige confirmação.

**Diagnóstico:**
```bash
pnpm db:check
```
Se aparecer uma linha com `batch: '-1'`, é esse o problema.

**Solução imediata:**
```bash
pnpm db:fix-dev-migration
```

Isso faz `UPDATE payload_migrations SET batch = 1 WHERE batch = -1` e
limpa o aviso. O schema em si já está aplicado (a dev push alterou
as tabelas in-place), só estamos sincronizando o controle de migrations.

**Solução de longo prazo:** Usar um **branch `dev` no Neon** para desenvolvimento local, e nunca apontar `.env.local` para a branch `main` (produção). Veja [`workflow_guide.md`](../workflow_guide.md#3-branch-dev-do-neon-essencial) para o setup completo.

---

## 2. `pnpm dev` reclama de secret ausente (`missing secret key`)

**Sintoma:** Ao rodar `pnpm tsx scripts/seed.ts` ou qualquer script que faça `getPayload({ config })`:
```
Error: missing secret key. A secret key is needed to secure Payload.
```

**Causa raiz:** O `payload.config.ts` faz `secret: process.env.PAYLOAD_SECRET` no momento do import. Se o `dotenv` rodar **depois** desse import (que é o que acontece com `import` no topo do arquivo), a env var ainda está vazia.

**Solução:** Sempre importar `scripts/_load-env.ts` como **primeira linha** do script, antes de tudo:
```ts
import './_load-env'   // ← tem que ser literalmente a primeira coisa
const { getPayload } = await import('payload')
```
O `_load-env.ts` carrega `prod.env` (se existir) e `.env.local`, e seta `PAYLOAD_MIGRATING=true` para evitar dev push.

---

## 3. `payload migrate` cria nova migration com nome `dev` toda vez que roda um script

**Sintoma:** Rodou um script com `getPayload({ config })`, e em seguida `pnpm db:check` mostra um registro novo na tabela:
```
id │ name │ batch
 4 │ dev  │  -1
```

**Causa raiz:** O `getPayload()` em modo normal (sem `PAYLOAD_MIGRATING=true`) detecta divergência entre o schema em `src/payload-types.ts` e o schema real do banco, e faz um "dev push" automático. Isso é conveniente em dev, mas vira lixo em prod.

**Solução:** `scripts/_load-env.ts` já seta `PAYLOAD_MIGRATING=true` automaticamente para qualquer script em `scripts/`. Se você está escrevendo um novo script, **sempre** comece com `import './_load-env'`.

---

## 4. Warning `[WARN] The "pnpm" field in package.json is no longer read by pnpm`

**Sintoma:**
```
[WARN] The "pnpm" field in package.json is no longer read by pnpm.
The following keys were ignored: "pnpm.onlyBuiltDependencies".
```

**Causa raiz:** A partir do pnpm 10, a chave `pnpm.onlyBuiltDependencies` no `package.json` foi descontinuada. O novo local é `pnpm-workspace.yaml`.

**Solução:** Manter `pnpm-workspace.yaml` no projeto com:
```yaml
onlyBuiltDependencies:
  - sharp
  - esbuild
  - unrs-resolver
```
E remover a chave `pnpm` do `package.json`. Já está configurado no repositório.

---

## 5. Warning `Detected "engines": { "node": ">=24.15.0" }` no build do Vercel

**Sintoma:** No log do Vercel:
```
Warning: Detected "engines": { "node": ">=24.15.0" } in your package.json
that will automatically upgrade when a new major Node.js Version is released.
```

**Causa raiz:** O operador `>=` faz o Vercel interpretar isso como "use a major mais recente que satisfaça a versão". Isso pode quebrar deploys quando sai uma major nova.

**Solução:** Usar `engines.node: "24.x"` (pina a major) no `package.json`. Já está configurado.

---

## 6. Deploy falha com `Type error: 'storage' does not exist in type 'Config'`

**Sintoma:** Build do Vercel falha no type check:
```
./src/payload.config.ts:114:3
Type error: Object literal may only specify known properties, and 'storage' does not exist in type 'Config'.
```

**Causa raiz:** No Payload 3, o storage adapter (`vercelBlobStorage`) deve ser passado dentro do array `plugins`, não como chave de topo do `buildConfig`.

**Solução correta:**
```ts
export default buildConfig({
  // ...
  plugins: [
    vercelBlobStorage({
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
    ...plugins,
  ],
})
```

---

## 7. `pnpm dev` contra o Neon de prod cria "dev migration" no banco errado

**Sintoma:** Tudo funciona, mas o `pnpm db:check` mostra entradas `dev` com `batch = -1` depois de rodar `pnpm dev`.

**Causa raiz:** O `pnpm dev` faz auto-push de schema no banco configurado em `POSTGRES_URL`. Se o seu `.env.local` aponta para a `main` do Neon (produção), você está fazendo dev-push em prod.

**Solução:** Criar um branch `dev` no Neon e apontar `.env.local` para ele. Veja [`workflow_guide.md`](../workflow_guide.md#3-branch-dev-do-neon-essencial).

---

## 8. Seed via script falha com `blob already exists`

**Sintoma:** Ao rodar `pnpm db:seed`:
```
Vercel Blob: This blob already exists, use `allowOverwrite: true` if you want to overwrite it.
```

**Causa raiz:** Os arquivos de seed (imagens em `src/endpoints/seed/`) já foram enviados para o Vercel Blob num seed anterior, e o Blob não aceita nomes duplicados por padrão.

**Solução mais simples (recomendada):** usar os scripts utilitários novos:
```bash
# Ver o que tem no Vercel Blob (sem deletar nada)
pnpm blob:list

# Apagar TUDO do Blob store (pede confirmação, exige --force)
pnpm blob:reset --force
pnpm db:seed
```
> Nota: o plugin `@payloadcms/storage-vercel-blob` (versão 3.85.x) não
> expõe a opção `allowOverwrite` no TypeScript, mesmo que o SDK do
> Vercel Blob aceite. A solução padrão é limpar o store antes de
> re-seedar — `blob:reset` faz isso de forma segura (lista tudo
> primeiro, exige `--force` para realmente deletar).

**Alternativas manuais:**
- Apagar manualmente os blobs no painel do Vercel Blob Storage e rodar `pnpm db:seed` de novo.
- Usar o botão **"Seed the database"** no admin UI, que tem lógica de overwrite.
- Configurar `addRandomSuffix: true` no `vercelBlobStorage` (vai gerar URLs únicas a cada seed, mas polui o storage).

---

## 9. Comandos úteis (resumo)

```bash
# Inspecionar estado do banco
pnpm db:check

# Limpar dev migrations deixadas em prod
pnpm db:fix-dev-migration

# Rodar seed via CLI (precisa de blobs limpos ou blob com overwrite)
pnpm db:seed

# Ver o que o Vercel está rodando
vercel logs <URL-do-deploy>

# Sincronizar envs do Vercel para a máquina (cuidado: sobrescreve .env.local)
vercel env pull

# Baixar envs de prod (vai para prod.env, que é .gitignored)
vercel env pull --environment=production
```

---

## 10. Comandos perigosos — pense duas vezes

```bash
# ⚠️  APAGA TODOS OS DADOS do banco que estiver em POSTGRES_URL
pnpm payload migrate:fresh

# ⚠️  DROP todas as tabelas e roda todas as migrations de novo
pnpm payload migrate:reset

# ⚠️  Apaga a branch do Neon (irreversível)
neonctl branches delete <branch>
```

Sempre confirme o banco de destino (rode `pnpm db:check` antes) antes
de qualquer um desses.
