/**
 * scripts/ensure-posts-page.ts
 *
 * Garante que a Page "posts" (listagem do Blog) existe no CMS.
 * Idempotente: só cria se não existir. Seguro rodar múltiplas vezes.
 *
 * Uso:
 *   bun tsx scripts/ensure-posts-page.ts
 *
 * Este script é complementar ao seed completo (bun db:seed).
 * Use quando quiser adicionar a página de listagem do blog sem
 * apagar o resto dos dados.
 */
import './_load-env'

import { getPayload } from 'payload'
import config from '../src/payload.config'
import { postsPage } from '../src/endpoints/seed/posts-page'

const payload = await getPayload({ config })

console.log('🔍 Verificando se a Page "posts" (Blog) existe...')

const existing = await payload.find({
  collection: 'pages',
  where: {
    slug: {
      equals: 'posts',
    },
  },
  limit: 1,
  overrideAccess: true,
})

if (existing.docs.length > 0) {
  console.log('✅ Page "posts" já existe no CMS. Nada a fazer.')
  console.log(`   ID: ${existing.docs[0].id}`)
  console.log(`   Title: ${existing.docs[0].title}`)
  console.log(`   Slug: ${existing.docs[0].slug}`)
  console.log(`   Status: ${existing.docs[0]._status}`)
  process.exit(0)
}

console.log('📝 Page "posts" não encontrada. Criando...')

const created = await payload.create({
  collection: 'pages',
  data: postsPage(),
  overrideAccess: true,
})

console.log('✅ Page "posts" criada com sucesso!')
console.log(`   ID: ${created.id}`)
console.log(`   Title: ${created.title}`)
console.log(`   Slug: ${created.slug}`)
console.log(`   Status: ${created._status}`)
console.log('')
console.log('📌 Próximos passos:')
console.log('   1. Acesse http://localhost:3000/admin')
console.log('   2. Vá em Collections → Pages → Blog')
console.log('   3. Edite o hero, ArchiveBlock, SEO conforme necessário')
console.log('   4. Acesse http://localhost:3000/posts para ver a listagem')

process.exit(0)
