/**
 * scripts/blob-list.ts
 *
 * Lista todos os blobs no Vercel Blob store conectado via BLOB_READ_WRITE_TOKEN.
 * Útil pra inspecionar o que tem antes de deletar com `pnpm blob:reset`.
 *
 * Uso: pnpm blob:list
 */
import './_load-env'
import { list } from '@vercel/blob'

const token = process.env.BLOB_READ_WRITE_TOKEN
if (!token) {
  console.error('BLOB_READ_WRITE_TOKEN não definida.')
  process.exit(1)
}

let cursor: string | undefined
let total = 0
let page = 0
do {
  const res = await list({ token, cursor })
  page += 1
  console.log(`--- página ${page} (${res.blobs.length} blobs) ---`)
  for (const b of res.blobs) {
    console.log(`  ${b.pathname}  ${(b.size / 1024).toFixed(1)} KB  ${b.uploadedAt.toISOString()}`)
    total += 1
  }
  cursor = res.cursor
} while (cursor)

console.log(`\nTotal: ${total} blob(s).`)
process.exit(0)
