import { RequiredDataFromCollectionSlug } from 'payload'
import type { PostArgs } from './post-1'

/**
 * Post 2 — Por que escolhi Neon Postgres para o banco de produção.
 * Demonstra: rich text, banner info, headings, code, mediaBlock.
 * Categorizado como "DevOps" e "Backend".
 */
export const post2: (args: PostArgs) => RequiredDataFromCollectionSlug<'posts'> = ({
  heroImage,
  blockImage,
  author,
}) => {
  return {
    slug: 'por-que-neon-postgres',
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
                text: 'Quando comecei a pensar em banco de dados para o site, considerei Supabase, PlanetScale, Railway, RDS e Neon. Neon ganhou — mas não por ser o "melhor Postgres do mundo", e sim porque branching de banco combina perfeitamente com preview de deploy.',
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
              blockName: 'O que é branching',
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
                          text: 'Branching de banco: ',
                          version: 1,
                        },
                        {
                          type: 'text',
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: 'cada branch Git pode ter sua própria cópia isolada do banco, criada em segundos, com custo quase zero (storage compartilhado via copy-on-write).',
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
                text: 'O problema clássico de dev contra prod',
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
                text: 'Todo dev já passou por isso: roda pnpm dev sem perceber que a DATABASE_URL aponta pra prod, o auto-migrate do ORM roda, e agora tem 30 minutos pra reverter antes do cliente perceber. Com branch de banco, isso vira um não-problema: sua branch dev aponta para uma cópia isolada. Pode bagunçar à vontade.',
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
                text: 'Setup que funcionou aqui',
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
                text: 'Tenho três branches no Neon: main (produção), dev (a que uso localmente), e preview/* (criadas automaticamente pelo Vercel para cada PR). Cada uma com seu connection string isolado. A Vercel injeta o DATABASE_URL certo em cada ambiente.',
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
                text: 'Snippet: o helper que uso pra checar o estado do banco',
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
              blockName: 'db-check',
              blockType: 'code',
              code: `import pg from 'pg'

const client = new pg.Client({ connectionString: process.env.POSTGRES_URL })
await client.connect()

const migrations = await client.query(\`
  SELECT id, name, batch, created_at
  FROM payload_migrations
  ORDER BY id
\`)

console.table(migrations.rows)

const tables = await client.query(\`
  SELECT COUNT(*)::int as total
  FROM information_schema.tables
  WHERE table_schema = 'public'
\`)
console.log('Total de tabelas no schema public:', tables.rows[0].total)`,
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
                text: 'Rodo isso sempre antes de mexer no banco. Se aparecer uma linha com batch = -1, sei que alguém rodou dev contra esse banco — preciso corrigir antes de qualquer deploy.',
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
                text: 'O que eu gostaria que tivessem me avisado antes',
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
                text: 'O pool de conexões do Neon é limitado em projetos free — o connection pooler (o endpoint -pooler no hostname) é obrigatório em serverless, senão você estour o limite de conexões em produção rapidamente. Payload resolve isso automaticamente quando você usa vercelPostgresAdapter com a URL pooler.',
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
              blockName: 'Veredito',
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
                          text: 'Para um site pessoal ou um SaaS pequeno, Neon é imbatível em DX. Para um sistema com muito write throughput, considere outro caminho — o auto-suspend do Neon (que desliga o compute quando ninguém usa) é ótimo pra custo, mas a primeira query depois de uma pausa tem ~500ms de latência.',
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
        'Branching de banco, preview por PR, e por que escolhi Neon Postgres para meu portfólio Next.js.',
      image: heroImage.id,
      title: 'Por que escolhi Neon Postgres',
    },
    relatedPosts: [],
    title: 'Por que escolhi Neon Postgres',
  }
}
