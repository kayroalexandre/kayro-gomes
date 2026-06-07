/**
 * scripts/db-fix-dev-migration.ts
 *
 * Marca qualquer migration com batch=-1 (criada por pnpm dev / dev push)
 * como batch=1, tratando-a como já aplicada. Isso elimina o prompt
 * interativo "data loss will occur" que o `payload migrate` mostra em CI.
 *
 * Seguro de rodar em prod: a dev push já alterou o schema in-place,
 * estamos só atualizando a tabela de controle de migrations para refletir isso.
 *
 * Uso: pnpm db:fix-dev-migration
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

const { rows: before } = await client.query(
  `SELECT id, name, batch FROM payload_migrations ORDER BY id`,
)

const { rowCount } = await client.query(
  `UPDATE payload_migrations SET batch = 1 WHERE batch = -1`,
)

console.log('Antes:')
console.table(before)
console.log(`\nLimpou ${rowCount} dev migration(s) (batch -1 → 1).`)

const { rows: after } = await client.query(
  `SELECT id, name, batch FROM payload_migrations ORDER BY id`,
)
console.log('\nDepois:')
console.table(after)

if ((rowCount ?? 0) > 0) {
  console.log('\n✓ Agora `pnpm payload migrate` roda sem prompt. Pode commitar e dar push.')
}

await client.end()
