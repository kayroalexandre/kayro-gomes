import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest, File } from 'payload'

import { contactForm as contactFormData } from './contact-form'
import { contact as contactPageData } from './contact-page'
import { home } from './home'
import { image1 } from './image-1'
import { image2 } from './image-2'
import { imageHero1 } from './image-hero-1'
import { post1 } from './post-1'
import { post2 } from './post-2'
import { post3 } from './post-3'
import { project1 } from './project-1'
import { project2 } from './project-2'
import { project3 } from './project-3'
import { sobre as sobrePageData } from './sobre-page'

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'projects',
  'forms',
  'form-submissions',
  'search',
]

const globals: GlobalSlug[] = ['header', 'footer']

/**
 * Categorias em PT-BR. Cada post abaixo é categorizado manualmente
 * no array `categoryMap` mais embaixo.
 */
const categories = ['Frontend', 'Backend', 'DevOps', 'CMS', 'Reflexões'] as const

type CategorySlug = (typeof categories)[number]

/** Mapeia cada post a uma ou mais categorias pelo slug do post. */
const categoryMap: Record<string, CategorySlug[]> = {
  'migrando-para-payload-cms-nextjs': ['CMS', 'Frontend'],
  'por-que-neon-postgres': ['DevOps', 'Backend'],
  'server-components-nextjs-15': ['Frontend', 'Reflexões'],
}

/** Mapeia cada projeto a uma ou mais categorias pelo slug do projeto. */
const projectCategoryMap: Record<string, CategorySlug[]> = {
  'ecommerce-payload-nextjs': ['Frontend', 'Backend'],
  'neon-branch-cli': ['DevOps', 'Backend'],
  'api-rest-openapi-sdk': ['Backend', 'DevOps'],
}

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  payload.logger.info(`— Clearing collections and globals...`)

  // Limpa globals (mantém só `navItems: []` no header/footer)
  await Promise.all(
    globals.map((global) =>
      payload.updateGlobal({
        slug: global,
        data: { navItems: [] },
        depth: 0,
        context: { disableRevalidate: true },
        req,
      }),
    ),
  )

  // Limpa collections e versões — sequencial para evitar deadlock no Postgres.
  // Em paralelo, tabelas `_rels` (que têm FKs para várias collections) travam
  // entre si quando múltiplas collections são apagadas ao mesmo tempo.
  for (const collection of collections) {
    await payload.db.deleteMany({ collection, req, where: {} })
  }
  for (const collection of collections.filter(
    (collection) => Boolean(payload.collections[collection].config.versions),
  )) {
    await payload.db.deleteVersions({ collection, req, where: {} })
  }

  payload.logger.info(`— Seeding demo author and user...`)

  // Remove o author anterior para re-seed limpo
  await payload.delete({
    collection: 'users',
    depth: 0,
    where: { email: { equals: 'demo-author@example.com' } },
    req,
  })

  payload.logger.info(`— Seeding media...`)

  // Baixa as imagens de demo (vindas do repo oficial da Payload).
  // Para um site em produção real, recomendo substituir essas URLs por
  // imagens próprias via admin antes de ir ao ar.
  const [image1Buffer, image2Buffer, image3Buffer, hero1Buffer] = await Promise.all([
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post1.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post2.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post3.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-hero1.webp',
    ),
  ])

  // Cria o demo author PRIMEIRO, depois as mídias em sequência (não
  // Promise.all) — Payload mutates req.file entre chamadas e misturar
  // user (sem file) com media (com file) causa race condition.
  const demoAuthor = await payload.create({
    collection: 'users',
    data: {
      name: 'Kayro Gomes',
      email: 'demo-author@example.com',
      password: 'password',
    },
    req,
  })

  const image1Doc = await payload.create({
    collection: 'media',
    data: image1,
    file: image1Buffer,
    req,
  })
  const image2Doc = await payload.create({
    collection: 'media',
    data: image2,
    file: image2Buffer,
    req,
  })
  const image3Doc = await payload.create({
    collection: 'media',
    data: image2,
    file: image3Buffer,
    req,
  })
  const imageHomeDoc = await payload.create({
    collection: 'media',
    data: imageHero1,
    file: hero1Buffer,
    req,
  })

  payload.logger.info(`— Seeding categories (PT-BR)...`)

  // Cria as categorias e captura os IDs em um map slug → id
  const categoryIds: Record<string, number> = {}
  await Promise.all(
    categories.map((category) =>
      payload
        .create({
          collection: 'categories',
          data: { title: category, slug: category.toLowerCase() },
          req,
        })
        .then((doc) => {
          categoryIds[category.toLowerCase()] = doc.id
        }),
    ),
  )

  payload.logger.info(`— Seeding posts (PT-BR)...`)

  // Cria os posts em ordem (sequencial) para manter createdAt previsível
  const post1Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: { disableRevalidate: true },
    data: post1({ heroImage: image1Doc, blockImage: image2Doc, author: demoAuthor }),
    req,
  })
  const post2Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: { disableRevalidate: true },
    data: post2({ heroImage: image2Doc, blockImage: image3Doc, author: demoAuthor }),
    req,
  })
  const post3Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: { disableRevalidate: true },
    data: post3({ heroImage: image3Doc, blockImage: image1Doc, author: demoAuthor }),
    req,
  })

  // Associa cada post às suas categorias
  const postDocs = [post1Doc, post2Doc, post3Doc]
  for (const post of postDocs) {
    const cats = categoryMap[post.slug] || []
    const catIds = cats.map((c) => categoryIds[c.toLowerCase()]).filter(Boolean)
    if (catIds.length > 0) {
      await payload.update({
        id: post.id,
        collection: 'posts',
        data: { categories: catIds },
        req,
      })
    }
  }

  // Related posts: cada post aponta para os outros 2
  await payload.update({
    id: post1Doc.id,
    collection: 'posts',
    data: { relatedPosts: [post2Doc.id, post3Doc.id] },
    req,
  })
  await payload.update({
    id: post2Doc.id,
    collection: 'posts',
    data: { relatedPosts: [post1Doc.id, post3Doc.id] },
    req,
  })
  await payload.update({
    id: post3Doc.id,
    collection: 'posts',
    data: { relatedPosts: [post1Doc.id, post2Doc.id] },
    req,
  })

  payload.logger.info(`— Seeding projects (PT-BR)...`)

  // Cria os projetos em ordem (sequencial)
  const project1Doc = await payload.create({
    collection: 'projects',
    depth: 0,
    context: { disableRevalidate: true },
    data: project1({ coverImage: image1Doc, blockImage: image2Doc }),
    req,
  })
  const project2Doc = await payload.create({
    collection: 'projects',
    depth: 0,
    context: { disableRevalidate: true },
    data: project2({ coverImage: image2Doc, blockImage: image3Doc }),
    req,
  })
  const project3Doc = await payload.create({
    collection: 'projects',
    depth: 0,
    context: { disableRevalidate: true },
    data: project3({ coverImage: image3Doc, blockImage: image1Doc }),
    req,
  })

  // Associa cada projeto às suas categorias
  const projectDocs = [project1Doc, project2Doc, project3Doc]
  for (const project of projectDocs) {
    const cats = projectCategoryMap[project.slug] || []
    const catIds = cats.map((c) => categoryIds[c.toLowerCase()]).filter(Boolean)
    if (catIds.length > 0) {
      await payload.update({
        id: project.id,
        collection: 'projects',
        data: { categories: catIds },
        req,
      })
    }
  }

  payload.logger.info(`— Seeding contact form...`)

  const contactForm = await payload.create({
    collection: 'forms',
    depth: 0,
    data: contactFormData,
    req,
  })

  payload.logger.info(`— Seeding pages (home, sobre, contato)...`)

  const [homePage, contactPage, sobrePage] = await Promise.all([
    payload.create({
      collection: 'pages',
      depth: 0,
      data: home({ heroImage: imageHomeDoc, metaImage: image2Doc }),
      req,
    }),
    payload.create({
      collection: 'pages',
      depth: 0,
      data: contactPageData({ contactForm }),
      req,
    }),
    payload.create({
      collection: 'pages',
      depth: 0,
      data: sobrePageData(),
      req,
    }),
  ])

  payload.logger.info(`— Seeding globals (header nav + footer nav)...`)

  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          { link: { type: 'custom', label: 'Início', url: '/' } },
          { link: { type: 'custom', label: 'Blog', url: '/posts' } },
          { link: { type: 'custom', label: 'Projetos', url: '/projetos' } },
          { link: { type: 'reference', label: 'Sobre', reference: { relationTo: 'pages', value: sobrePage.id } } },
          { link: { type: 'reference', label: 'Contato', reference: { relationTo: 'pages', value: contactPage.id } } },
        ],
      },
      req,
    }),
    payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: [
          { link: { type: 'custom', label: 'GitHub', newTab: true, url: 'https://github.com/kayroalexandre' } },
          { link: { type: 'custom', label: 'LinkedIn', newTab: true, url: 'https://linkedin.com/in/kayroalexandre' } },
          { link: { type: 'custom', label: 'Admin', url: '/admin' } },
        ],
      },
      req,
    }),
  ])

  // homePage é capturado pelo linter warning; silenciar explicitamente
  void homePage

  payload.logger.info('Seeded database successfully!')
}

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()}`,
    size: data.byteLength,
  }
}
