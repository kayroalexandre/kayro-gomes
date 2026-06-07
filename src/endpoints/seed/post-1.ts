import type { Media, User } from '@/payload-types'
import { RequiredDataFromCollectionSlug } from 'payload'

export type PostArgs = {
  heroImage: Media
  blockImage: Media
  author: User
}

/**
 * Post 1 — Como migrei este site para Payload CMS + Next.js 15.
 * Demonstra: rich text, headings (h2/h3/h4), banner block, code block
 * com syntax highlighting, mediaBlock. Categorizado como "CMS" e "Frontend".
 */
export const post1: (args: PostArgs) => RequiredDataFromCollectionSlug<'posts'> = ({
  heroImage,
  blockImage,
  author,
}) => {
  return {
    slug: 'migrando-para-payload-cms-nextjs',
    _status: 'published',
    authors: [author],
    content: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Este site já foi WordPress, depois Next.js puro com MDX, depois um blog estático. Em 2026 migrei para Payload CMS 3 rodando em cima de Next.js 15 com Postgres no Neon e deploy na Vercel. A decisão foi menos sobre "qual CMS é melhor" e mais sobre "quero editar conteúdo pelo navegador, mas sem abrir mão do React quando precisar".',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Por que Payload',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h2',
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Payload mora dentro do seu app Next.js como um pacote npm. Não é um servidor separado, não é uma API externa — você define as collections, registra os plugins, e ele aparece em /admin automaticamente. Para um portfólio pessoal, isso é ouro: posso customizar a UI, adicionar blocos novos, mudar a estrutura dos posts sem pedir permissão a ninguém.',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: 'block',
            fields: {
              blockName: 'TL;DR',
              blockType: 'banner',
              content: {
                root: {
                  type: 'root',
                  children: [
                    {
                      type: 'paragraph',
                      children: [
                        {
                          type: 'text',
                          detail: 0,
                          format: 1,
                          mode: 'normal',
                          style: '',
                          text: 'TL;DR: ',
                          version: 1,
                        },
                        {
                          type: 'text',
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: 'Payload + Next.js 15 + Neon + Vercel = CMS moderno, deploy trivial, preview ao vivo, e código 100% aberto pra eu hackear quando quiser.',
                          version: 1,
                        },
                      ],
                      direction: 'ltr',
                      format: '',
                      indent: 0,
                      textFormat: 0,
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  version: 1,
                },
              },
              style: 'info',
            },
            format: '',
            version: 2,
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'A migração em 4 passos',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h2',
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Não precisei reescrever o site. O processo foi:',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: '1. Schema das collections',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h3',
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Defini Posts, Pages, Categories, Media, Forms e Users em arquivos TypeScript. Cada field do schema vira coluna no Postgres automaticamente — o adapter vercelPostgresAdapter cuida do DDL. Quando você roda pnpm dev pela primeira vez, o Payload compara o schema com o banco e faz push das diferenças (em prod, ele exige migrations explícitas via pnpm payload migrate).',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: '2. Storage de mídia',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h3',
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Em vez de armazenar uploads no filesystem do Vercel (que é efêmero), usei o plugin @payloadcms/storage-vercel-blob. Cada upload vai pro Vercel Blob, e o Payload guarda só a URL no banco. As variantes (thumbnail, square, small, medium, large) são geradas via sharp no onUpload.',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: '3. Renderização no front',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h3',
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'As páginas de [slug] e /posts/[slug] usam getPayload({ config }) direto no Server Component. Sem API route, sem GraphQL, sem cache manual — o Next lida com tudo via React Server Components. A página é gerada estaticamente no build e revalidada por tag quando você publica uma página nova no admin.',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Exemplo: query de página com draft mode',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h3',
            version: 1,
          },
          {
            type: 'block',
            fields: {
              blockName: 'queryPageBySlug',
              blockType: 'code',
              code: `const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: { slug: { equals: slug } },
  })

  return result.docs?.[0] || null
})`,
              language: 'typescript',
            },
            format: '',
            version: 2,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Note o draft mode: quando você entra em preview pelo admin, a página renderiza a versão _draft=true antes de publicar. Em produção, só vê a versão publicada.',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: '4. O que eu queria e o que consegui',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h2',
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Queria preview ao vivo sem dor, versionamento de posts, e a possibilidade de customizar o editor com blocos novos (tipo um "Callout" ou "Code Snippet" especializado). Tudo isso veio de fábrica. O que ainda dá trabalho: deploy com dev mode acidental poluindo a tabela payload_migrations — daí ter um branch dev separado no Neon e checagem automática no build.',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
          {
            type: 'block',
            fields: {
              blockName: '',
              blockType: 'mediaBlock',
              media: blockImage.id,
            },
            format: '',
            version: 2,
          },
          {
            type: 'block',
            fields: {
              blockName: 'Próximos passos',
              blockType: 'banner',
              content: {
                root: {
                  type: 'root',
                  children: [
                    {
                      type: 'paragraph',
                      children: [
                        {
                          type: 'text',
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: 'Nos próximos posts vou detalhar o setup Neon + branch dev (isolando ambiente local sem tocar produção) e o que aprendi migrando a busca de Fuse.js para a busca nativa do Payload. Se tiver dúvida ou quer ver o código-fonte completo, o repo está aberto.',
                          version: 1,
                        },
                      ],
                      direction: 'ltr',
                      format: '',
                      indent: 0,
                      textFormat: 0,
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  version: 1,
                },
              },
              style: 'success',
            },
            format: '',
            version: 2,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    heroImage: heroImage.id,
    meta: {
      description:
        'Por que migrei meu portfólio para Payload CMS 3 + Next.js 15, e o que aprendi no processo (preview, mídia, deploy).',
      image: heroImage.id,
      title: 'Migrando para Payload CMS + Next.js 15',
    },
    relatedPosts: [], // populado pelo seed
    title: 'Migrando para Payload CMS + Next.js 15',
  }
}
