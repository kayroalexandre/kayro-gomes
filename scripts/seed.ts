/**
 * scripts/seed.ts
 *
 * Roda o seed do banco de dados (mesmo seed que o botão "Seed the database"
 * do admin usa, mas via CLI). Conecta em POSTGRES_URL e popula as
 * collections com conteúdo de demo.
 *
 * Atenção: se você já rodou o seed antes e o Vercel Blob tem os mesmos
 * nomes de arquivo, o upload vai falhar com "blob already exists".
 * Solução: apagar os blobs no painel do Vercel Blob Storage, ou usar
 * o botão do admin UI que tem lógica de overwrite.
 *
 * Uso: pnpm db:seed
 */
import './_load-env'

const { getPayload, createLocalReq } = await import('payload')
const { default: config } = await import('../src/payload.config.js')
const { seed } = await import('../src/endpoints/seed/index.js')

console.log('Inicializando Payload...')
const payload = await getPayload({ config })

console.log('Gerando contexto de request...')
const req = await createLocalReq({}, payload)

console.log('Rodando seed...')
await seed({ payload, req })

console.log('✓ Seed concluído.')
process.exit(0)
