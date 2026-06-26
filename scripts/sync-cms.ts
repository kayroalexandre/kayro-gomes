/**
 * scripts/sync-cms.ts
 *
 * Sincroniza o CMS com o front-end:
 *  1. Garante os itens de navegação na collection `menu` (idempotente por label)
 *     e liga `header.menu` com [Posts, Projetos, Contato].
 *  2. Liga `footer.menu` com os mesmos itens (idempotente).
 *  3. Adiciona um bloco "Projetos recentes" (archive de projects) na página
 *     `home`, antes do bloco CTA final. Idempotente: se o bloco já existir,
 *     não duplica.
 *
 * NÃO roda seed, NÃO apaga nada, NÃO cria migrations. Usa a local API do
 * Payload contra o banco configurado em POSTGRES_URL (via .env.local ou
 * prod.env) e seta PAYLOAD_MIGRATING=true (via _load-env) para evitar o
 * dev-push que cria entrada `batch=-1` em payload_migrations.
 *
 * Uso: bun tsx scripts/sync-cms.ts
 */
import './_load-env'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'
import type { RequiredDataFromCollectionSlug } from 'payload'

const payload = await getPayload({ config })

// --- 1. Resolver páginas por slug (precisamos dos IDs para os links internos)
const allPages = await payload.find({
  collection: 'pages',
  limit: 100,
  pagination: false,
  overrideAccess: true,
  depth: 0,
  select: { slug: true, title: true },
})

const pageBySlug = new Map<string, { id: number; title: string }>()
for (const p of allPages.docs) {
  pageBySlug.set(p.slug, { id: p.id as number, title: p.title })
}

const contatoId = pageBySlug.get('contato')?.id
if (!contatoId) {
  throw new Error('Página "contato" não encontrada no CMS. Crie-a no admin antes de rodar este script.')
}

// --- Itens de navegação desejados (fonte de verdade para header e footer).
// Ordem do array = ordem de exibição.
type MenuData = RequiredDataFromCollectionSlug<'menu'>

const desiredItems: MenuData[] = [
  { type: 'custom', label: 'Posts', url: '/posts', newTab: false },
  { type: 'custom', label: 'Projetos', url: '/projetos', newTab: false },
  {
    type: 'reference',
    label: 'Contato',
    reference: { relationTo: 'pages', value: contatoId },
    newTab: false,
  },
]

// --- 2. Garantir os itens na collection `menu` (idempotente por label).
// Busca os existentes por label, atualiza-os para o shape desejado e cria os
// que faltam. Retorna os IDs na ordem de `desiredItems`.
const labels = desiredItems.map((i) => i.label!)
const existing = await payload.find({
  collection: 'menu',
  limit: 100,
  pagination: false,
  overrideAccess: true,
  depth: 0,
  where: { label: { in: labels } },
})

const menuByLabel = new Map<string, number>()
for (const doc of existing.docs) {
  menuByLabel.set(doc.label, doc.id as number)
}

const menuIds: number[] = []
for (const item of desiredItems) {
  const existingId = menuByLabel.get(item.label!)
  if (existingId !== undefined) {
    await payload.update({
      collection: 'menu',
      id: existingId,
      data: item,
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
    menuIds.push(existingId)
  } else {
    const created = await payload.create({
      collection: 'menu',
      data: item,
      overrideAccess: true,
      depth: 0,
      context: { disableRevalidate: true },
    })
    menuIds.push(created.id as number)
  }
}
console.log(`✓ Menu sincronizado: ${menuIds.length} itens garantidos na collection.`)

// --- 3. Ligar header.menu e footer.menu aos IDs (idempotente).
const sameIds = (before: unknown, ids: number[]): boolean => {
  if (!Array.isArray(before)) return false
  const beforeIds = before.map((v) => (typeof v === 'object' && v !== null ? (v as { id: number }).id : v))
  return beforeIds.length === ids.length && beforeIds.every((v, i) => v === ids[i])
}

const headerBefore = await payload.findGlobal({ slug: 'header', depth: 0 })
if (sameIds(headerBefore.menu, menuIds)) {
  console.log('= Header já está sincronizado. Nada a fazer.')
} else {
  await payload.updateGlobal({
    slug: 'header',
    data: { menu: menuIds },
    overrideAccess: true,
    context: { disableRevalidate: true },
  })
  console.log(`✓ Header atualizado: ${menuIds.length} itens de menu.`)
}

const footerBefore = await payload.findGlobal({ slug: 'footer', depth: 0 })
if (sameIds(footerBefore.menu, menuIds)) {
  console.log('= Footer já está sincronizado. Nada a fazer.')
} else {
  await payload.updateGlobal({
    slug: 'footer',
    data: { menu: menuIds },
    overrideAccess: true,
    context: { disableRevalidate: true },
  })
  console.log(`✓ Footer atualizado: ${menuIds.length} itens de menu.`)
}

// --- 4. Adicionar bloco "Projetos recentes" na home (se não existir)
const home = await payload.find({
  collection: 'pages',
  limit: 1,
  pagination: false,
  overrideAccess: true,
  depth: 0,
  where: { slug: { equals: 'home' } },
})

if (home.docs.length === 0) {
  throw new Error('Página "home" não encontrada no CMS. Crie-a no admin antes de rodar este script.')
}

const homeDoc = home.docs[0]
const layout = Array.isArray(homeDoc.layout) ? [...homeDoc.layout] : []

const alreadyHasProjectsArchive = layout.some(
  (b: any) => b?.blockType === 'archive' && b?.relationTo === 'projects',
)

if (alreadyHasProjectsArchive) {
  console.log('= Home já tem um archive de projects. Nada a fazer.')
} else {
  // Insere antes do bloco CTA final (se houver), senão no final
  const ctaIndex = layout.findIndex((b: any) => b?.blockType === 'cta')
  const insertAt = ctaIndex >= 0 ? ctaIndex : layout.length

  const projectsArchiveBlock = {
    id: `home-projects-archive-${Date.now()}`,
    blockName: 'Projetos recentes',
    blockType: 'archive' as const,
    introContent: {
      root: {
        type: 'root' as const,
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        children: [
          {
            tag: 'h2' as const,
            type: 'heading' as const,
            format: '' as const,
            indent: 0,
            version: 1,
            direction: 'ltr' as const,
            children: [
              {
                mode: 'normal' as const,
                text: 'Projetos recentes',
                type: 'text' as const,
                style: '',
                detail: 0,
                format: 0,
                version: 1,
              },
            ],
          },
          {
            type: 'paragraph' as const,
            format: '' as const,
            indent: 0,
            version: 1,
            direction: 'ltr' as const,
            textFormat: 0,
            children: [
              {
                mode: 'normal' as const,
                text: 'Aplicações, sites e bibliotecas que construí. Cada um com seu stack, contexto e o que aprendi no caminho.',
                type: 'text' as const,
                style: '',
                detail: 0,
                format: 0,
                version: 1,
              },
            ],
          },
        ],
      },
    },
    populateBy: 'collection' as const,
    relationTo: 'projects' as const,
    categories: [],
    limit: 6,
  }

  layout.splice(insertAt, 0, projectsArchiveBlock)

  await payload.update({
    collection: 'pages',
    id: homeDoc.id,
    data: { layout },
    overrideAccess: true,
    context: { disableRevalidate: true },
  })
  console.log(`✓ Home atualizada: bloco "Projetos recentes" inserido na posição ${insertAt}.`)
}

console.log('\nSincronização concluída.')
process.exit(0)
