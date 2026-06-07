/**
 * scripts/blob-reset.ts
 *
 * APAGA TODOS os blobs do Vercel Blob store conectado via BLOB_READ_WRITE_TOKEN.
 * Usado para limpar blobs duplicados deixados por seeds anteriores (que
 * travam o /next/seed com "blob already exists" → 500).
 *
 * ⚠️  DESTRUTIVO. Use com cuidado. Por padrão exige `--yes` na CLI do
 * pnpm (ou `pnpm blob:reset` no modo interativo).
 *
 * Uso:
 *   pnpm blob:list            # ver o que tem
 *   pnpm blob:reset           # apagar tudo (pede confirmação)
 *   pnpm blob:reset --force   # apagar sem perguntar
 */
import './_load-env'
import { list, del } from '@vercel/blob'

const token = process.env.BLOB_READ_WRITE_TOKEN
if (!token) {
  console.error('BLOB_READ_WRITE_TOKEN não definida.')
  process.exit(1)
}

const force = process.argv.includes('--force')

const toDelete: string[] = []
let cursor: string | undefined
do {
  const res = await list({ token, cursor })
  for (const b of res.blobs) toDelete.push(b.url)
  cursor = res.cursor
} while (cursor)

if (toDelete.length === 0) {
  console.log('Nenhum blob para apagar. ✓')
  process.exit(0)
}

console.log(`Encontrados ${toDelete.length} blob(s):`)
for (const url of toDelete) console.log('  -', url)

if (!force) {
  console.log('\n⚠️  Isso vai APAGAR TODOS esses blobs. Para confirmar, rode:')
  console.log('   pnpm blob:reset --force\n')
  process.exit(1)
}

console.log('\nApagando...')
await del(toDelete, { token })
console.log(`✓ ${toDelete.length} blob(s) apagados.`)
process.exit(0)
