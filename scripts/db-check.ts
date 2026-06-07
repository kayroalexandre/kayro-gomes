/**
 * scripts/db-check.ts
 *
 * Mostra o estado da tabela payload_migrations e quantas tabelas existem
 * no schema public. Útil pra diagnosticar se tem "dev migration" (batch=-1)
 * sobrando, que é o que causa o prompt "data loss will occur" no Vercel.
 *
 * Uso: pnpm db:check
 */
import './_load-env'
import pg from 'pg'

const url = process.env.POSTGRES_URL
if (!url) {
  console.error('POSTGRES_URL não definida. Rode com .env.local ou prod.env presente.')
  process.exit(1)
}

const client = new pg.Client({ connectionString: url })
await client.connect()

const { rows } = await client.query(`
  SELECT id, name, batch, created_at::text
  FROM payload_migrations
  ORDER BY id
`)

console.log('=== payload_migrations ===')
if (rows.length === 0) {
  console.log('(vazio — nenhuma migration foi aplicada)')
} else {
  console.table(rows)
}

const devRows = rows.filter((r) => String(r.batch) === '-1')
if (devRows.length > 0) {
  console.log(
    `\n⚠️  ${devRows.length} dev migration(s) com batch=-1. ` +
      `Rode \`pnpm db:fix-dev-migration\` para limpar.`,
  )
}

const { rows: cnt } = await client.query(
  `SELECT COUNT(*)::int AS n FROM information_schema.tables WHERE table_schema='public'`,
)
console.log(`\nTotal de tabelas no schema public: ${cnt[0].n}`)

const { rows: dbInfo } = await client.query(
  `SELECT current_database() AS db, current_user AS "user"`,
)
console.log(`Banco: ${dbInfo[0].db} (usuário: ${dbInfo[0].user})`)

await client.end()
