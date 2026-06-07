/**
 * scripts/sync-cms.ts
 *
 * Sincroniza o CMS com o front-end:
 *  1. Popula `header.navItems` com [Posts, Projetos, Contato] (idempotente).
 *  2. Popula `footer.navItems` com os mesmos itens (idempotente).
 *  3. Adiciona um bloco "Projetos recentes" (archive de projects) na página
 *     `home`, antes do bloco CTA final. Idempotente: se o bloco já existir,
 *     não duplica.
 *
 * NÃO roda seed, NÃO apaga nada, NÃO cria migrations. Usa a local API do
 * Payload contra o banco configurado em POSTGRES_URL (via .env.local ou
 * prod.env) e seta PAYLOAD_MIGRATING=true (via _load-env) para evitar o
 * dev-push que cria entrada `batch=-1` em payload_migrations.
 *
 * Uso: pnpm tsx scripts/sync-cms.ts
 */
import './_load-env'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'
import type { Header as HeaderType, Footer as FooterType } from '../src/payload-types.js'

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

const buildNavItems = (): NonNullable<HeaderType['navItems']> => [
  {
    id: 'nav-posts',
    link: {
      type: 'custom',
      url: '/posts',
      label: 'Posts',
      newTab: false,
    },
  },
  {
    id: 'nav-projetos',
    link: {
      type: 'custom',
      url: '/projetos',
      label: 'Projetos',
      newTab: false,
    },
  },
  {
    id: 'nav-contato',
    link: {
      type: 'reference',
      reference: { relationTo: 'pages', value: contatoId },
      label: 'Contato',
      newTab: false,
    },
  },
]

// --- 2. Header
const normalizeNavItem = (item: any): unknown => {
  if (!item || typeof item !== 'object') return item
  const link = item.link
  if (!link) return item
  const refValue = link.reference?.value
  const refId = typeof refValue === 'object' && refValue !== null ? refValue.id : refValue
  return {
    id: item.id,
    link: {
      type: link.type,
      newTab: link.newTab ?? false,
      label: link.label,
      url: link.type === 'custom' ? link.url : null,
      reference:
        link.reference && refId !== undefined
          ? { relationTo: link.reference.relationTo, value: refId }
          : undefined,
    },
  }
}

const headerBefore = await payload.findGlobal({ slug: 'header', depth: 0 })
const headerItems = buildNavItems()
const headerChanged =
  !Array.isArray(headerBefore.navItems) ||
  headerBefore.navItems.length !== headerItems.length ||
  JSON.stringify(headerBefore.navItems.map(normalizeNavItem)) !==
    JSON.stringify(headerItems.map(normalizeNavItem))

if (headerChanged) {
  await payload.updateGlobal({
    slug: 'header',
    data: { navItems: headerItems } as Partial<HeaderType>,
    overrideAccess: true,
    context: { disableRevalidate: true },
  })
  console.log('✓ Header atualizado: 3 navItems.')
} else {
  console.log('= Header já está sincronizado (3 navItems). Nada a fazer.')
}

// --- 3. Footer
const footerBefore = await payload.findGlobal({ slug: 'footer', depth: 0 })
const footerItems = buildNavItems()
const footerChanged =
  !Array.isArray(footerBefore.navItems) ||
  footerBefore.navItems.length !== footerItems.length ||
  JSON.stringify(footerBefore.navItems.map(normalizeNavItem)) !==
    JSON.stringify(footerItems.map(normalizeNavItem))

if (footerChanged) {
  await payload.updateGlobal({
    slug: 'footer',
    data: { navItems: footerItems } as Partial<FooterType>,
    overrideAccess: true,
    context: { disableRevalidate: true },
  })
  console.log('✓ Footer atualizado: 3 navItems.')
} else {
  console.log('= Footer já está sincronizado (3 navItems). Nada a fazer.')
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
