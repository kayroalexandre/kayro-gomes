import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media } from '@/payload-types'

type HomeArgs = {
  heroImage: Media
  metaImage: Media
}

/**
 * Página inicial (/) — portfólio pessoal do Kayro Gomes.
 * Conteúdo em PT-BR, com hero, seções de Sobre, Stack, Como trabalho,
 * destaque visual (MediaBlock), Arquivo de posts recentes e CTA final.
 *
 * Os blocos abaixo demonstram TODOS os tipos de bloco disponíveis na
 * collection `pages`: content, mediaBlock, archive e cta. Para editar
 * no admin, basta entrar em /admin/collections/pages e abrir a página
 * "Home".
 */
export const home: (args: HomeArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  heroImage,
  metaImage,
}) => {
  return {
    slug: 'home',
    _status: 'published',
    hero: {
      type: 'highImpact',
      links: [
        {
          link: {
            type: 'custom',
            appearance: 'default',
            label: 'Ler o blog',
            url: '/posts',
          },
        },
        {
          link: {
            type: 'custom',
            appearance: 'outline',
            label: 'Vamos conversar',
            url: '/contato',
          },
        },
      ],
      media: heroImage.id,
      richText: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Kayro Gomes',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              tag: 'h1',
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
                  text: 'Desenvolvedor full-stack brasileiro, focado em produtos web modernos com Next.js, TypeScript e Postgres. Aqui eu documento o que aprendo construindo — de deploys na Vercel a integrações com CMS headless.',
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
    },
    layout: [
      // ── 1. Sobre ─────────────────────────────────────────────
      {
        blockName: 'Sobre mim',
        blockType: 'content',
        columns: [
          {
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    children: [
                      {
                        type: 'text',
                        detail: 0,
                        format: 0,
                        mode: 'normal',
                        style: '',
                        text: 'Sobre',
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
                        text: 'Sou Kayro, desenvolvedor full-stack baseado no Brasil. Trabalho principalmente com o ecossistema JavaScript/TypeScript — Next.js no front, Node.js ou workers no back, Postgres como banco padrão. Gosto de projetos onde posso ir do design à produção sem trocar de chaveiro.',
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
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        detail: 0,
                        format: 0,
                        mode: 'normal',
                        style: '',
                        text: 'Este site é meu caderno público. Tudo aqui está conectado a este CMS (Payload) — posts, páginas, header, footer, mídia. Quando você edita uma página em /admin, o front-end re-renderiza automaticamente.',
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
            size: 'full',
          },
        ],
      },
      // ── 2. Stack (grid 3 colunas × 2 linhas) ─────────────────
      {
        blockName: 'Stack & ferramentas',
        blockType: 'content',
        columns: [
          {
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Frontend', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, tag: 'h3', version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'React, Next.js (App Router), TypeScript, Tailwind CSS, Radix UI, shadcn/ui.', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1,
                  },
                ],
                direction: 'ltr', format: '', indent: 0, version: 1,
              },
            },
            size: 'oneThird',
          },
          {
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Backend', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, tag: 'h3', version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Node.js, tRPC, REST, GraphQL, serverless functions, filas com Inngest e QStash.', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1,
                  },
                ],
                direction: 'ltr', format: '', indent: 0, version: 1,
              },
            },
            size: 'oneThird',
          },
          {
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Banco de dados', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, tag: 'h3', version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'PostgreSQL (Neon, Supabase), Drizzle ORM, Redis para cache e sessões.', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1,
                  },
                ],
                direction: 'ltr', format: '', indent: 0, version: 1,
              },
            },
            size: 'oneThird',
          },
          {
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'DevOps', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, tag: 'h3', version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Vercel, GitHub Actions, Docker, pnpm workspaces, Turbo para monorepos.', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1,
                  },
                ],
                direction: 'ltr', format: '', indent: 0, version: 1,
              },
            },
            size: 'oneThird',
          },
          {
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'CMS & conteúdo', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, tag: 'h3', version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Payload (este site), Sanity, Contentful, MDX para docs técnicas.', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1,
                  },
                ],
                direction: 'ltr', format: '', indent: 0, version: 1,
              },
            },
            size: 'oneThird',
          },
          {
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Ferramentas', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, tag: 'h3', version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'VS Code, Linear, Figma, Git, Playwright para testes E2E.', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1,
                  },
                ],
                direction: 'ltr', format: '', indent: 0, version: 1,
              },
            },
            size: 'oneThird',
          },
        ],
      },
      // ── 3. Como eu trabalho (3 passos) ───────────────────────
      {
        blockName: 'Como eu trabalho',
        blockType: 'content',
        columns: [
          {
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: '1. Descoberta', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, tag: 'h3', version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Entendo o problema antes de codar. Leio o código existente, converso com o time, mapeio as restrições reais (não as imaginadas).', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1,
                  },
                ],
                direction: 'ltr', format: '', indent: 0, version: 1,
              },
            },
            size: 'oneThird',
          },
          {
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: '2. Construção iterativa', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, tag: 'h3', version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Começo pelo caminho feliz, subo cedo em ambiente de homologação, ajusto o que precisa. PRs pequenos, descritivos e revisáveis.', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1,
                  },
                ],
                direction: 'ltr', format: '', indent: 0, version: 1,
              },
            },
            size: 'oneThird',
          },
          {
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: '3. Operação desde o dia 1', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, tag: 'h3', version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Logs, métricas, alertas, feature flags. Nada vai pra produção sem um plano pra sair de produção se der errado.', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1,
                  },
                ],
                direction: 'ltr', format: '', indent: 0, version: 1,
              },
            },
            size: 'oneThird',
          },
        ],
      },
      // ── 4. MediaBlock (imagem destaque) ─────────────────────
      {
        blockName: 'Imagem destaque',
        blockType: 'mediaBlock',
        media: metaImage.id,
      },
      // ── 5. Arquivo: últimos artigos ──────────────────────────
      {
        blockName: 'Artigos recentes',
        blockType: 'archive',
        categories: [],
        introContent: {
          root: {
            type: 'root',
            children: [
              {
                type: 'heading',
                children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Artigos recentes', version: 1 }],
                direction: 'ltr', format: '', indent: 0, tag: 'h2', version: 1,
              },
              {
                type: 'paragraph',
                children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Anotações, tutoriais e o que eu aprendo construindo coisas. Tudo escrito direto no admin, com versionamento, rascunhos e preview ao vivo.', version: 1 }],
                direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1,
              },
            ],
            direction: 'ltr', format: '', indent: 0, version: 1,
          },
        },
        populateBy: 'collection',
        relationTo: 'posts',
        limit: 6,
      },
      // ── 6. CTA final ─────────────────────────────────────────
      {
        blockName: 'Vamos conversar',
        blockType: 'cta',
        links: [
          {
            link: {
              type: 'custom',
              appearance: 'default',
              label: 'Entrar em contato',
              url: '/contato',
            },
          },
          {
            link: {
              type: 'custom',
              appearance: 'outline',
              label: 'Ver GitHub',
              newTab: true,
              url: 'https://github.com/kayroalexandre',
            },
          },
        ],
        richText: {
          root: {
            type: 'root',
            children: [
              {
                type: 'heading',
                children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Vamos trabalhar juntos?', version: 1 }],
                direction: 'ltr', format: '', indent: 0, tag: 'h2', version: 1,
              },
              {
                type: 'paragraph',
                children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Tem um projeto, ideia ou freela em mente? Manda mensagem — respondo rápido. Para oportunidades full-time, prefiro conversar por e-mail depois de uma primeira troca.', version: 1 }],
                direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1,
              },
            ],
            direction: 'ltr', format: '', indent: 0, version: 1,
          },
        },
      },
    ],
    meta: {
      description:
        'Portfólio e blog de Kayro Gomes, desenvolvedor full-stack brasileiro. Next.js, TypeScript, Postgres, Payload CMS.',
      image: heroImage.id,
      title: 'Kayro Gomes — Desenvolvedor Full-Stack',
    },
    title: 'Início',
  }
}
