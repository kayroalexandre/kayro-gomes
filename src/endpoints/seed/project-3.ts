import type { Media } from '@/payload-types'
import { RequiredDataFromCollectionSlug } from 'payload'

export type ProjectArgs = {
  coverImage: Media
  blockImage: Media
}

/**
 * Project 3 — API REST pública com rate limiting, autenticação JWT,
 * documentação OpenAPI gerada automaticamente e SDK TypeScript publicado no npm.
 */
export const project3: (args: ProjectArgs) => RequiredDataFromCollectionSlug<'projects'> = ({
  coverImage,
  blockImage,
}) => {
  return {
    slug: 'api-rest-openapi-sdk',
    _status: 'published',
    title: 'API REST com OpenAPI e SDK TypeScript',
    summary:
      'API REST pública com autenticação JWT, rate limiting por IP/tenant, documentação OpenAPI gerada do código e SDK TypeScript publicado no npm com tipos sincronizados.',
    coverImage: coverImage.id,
    tech: [
      { name: 'Hono' },
      { name: 'TypeScript' },
      { name: 'Zod' },
      { name: 'Postgres' },
      { name: 'OpenAPI' },
      { name: 'Bun' },
    ],
    liveUrl: 'https://github.com/kayroalexandre',
    repoUrl: 'https://github.com/kayroalexandre',
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
                text: 'Construí essa API para servir de backend público do meu portfólio: o site consome ela para listar projetos, posts, e enviar formulários. A ideia foi tratar a API como produto: documentação viva, SDKs versionados, e rate limiting justo.',
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
                text: 'Por que Hono',
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
                text: 'Hono roda em Bun, Vercel Edge, Cloudflare Workers, Deno, Node — o mesmo código. Para uma API pública, isso é enorme: posso mover de host sem reescrever nada. Performance também é o ponto: roteador baseado em radix tree, latência sub-ms no warm path.',
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
              blockName: 'route + validator',
              blockType: 'code',
              code: `import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

const CreateProjectSchema = z.object({
  title: z.string().min(3).max(120),
  summary: z.string().min(10).max(280),
  tech: z.array(z.string()).min(1).max(20),
  liveUrl: z.string().url().optional(),
  repoUrl: z.string().url().optional(),
})

app.post('/projects', zValidator('json', CreateProjectSchema), async (c) => {
  const data = c.req.valid('json')
  
  // A partir daqui, data é CreateProject tipado.
  // Sem cast, sem unknown, sem narrow manual.
  const project = await db.projects.create({ data })
  
  return c.json({ project }, 201)
})`,
              language: 'typescript',
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
                text: 'OpenAPI gerado do código',
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
                text: 'Em vez de manter um openapi.yaml à mão, eu gero do código no build. Cada rota exporta seu schema Zod, e o @hono/zod-openapi monta o spec. Resultado: a documentação em /docs está sempre sincronizada com o que o servidor realmente aceita.',
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
              blockName: 'spec generation',
              blockType: 'code',
              code: `import { OpenAPIHono } from '@hono/zod-openapi'

const app = new OpenAPIHono()

app.openapi(
  {
    method: 'post',
    path: '/projects',
    request: {
      body: { content: { 'application/json': { schema: CreateProjectSchema } } },
    },
    responses: {
      201: {
        description: 'Project created',
        content: { 'application/json': { schema: ProjectResponseSchema } },
      },
      400: { description: 'Validation error' },
      429: { description: 'Rate limit exceeded' },
    },
  },
  async (c) => {
    const data = c.req.valid('json')
    // ...
  }
)

// Gera /doc e /openapi.json automaticamente
app.doc('/openapi.json', { openapi: '3.1.0', info: { title: 'Kayro API', version: '1.0.0' } })`,
              language: 'typescript',
            },
            format: '',
            version: 2,
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
              blockName: 'Resultado',
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
                          text: 'O SDK npm é gerado do mesmo openapi.json via openapi-typescript. O consumidor importa o cliente tipado e o autocomplete do editor mostra os campos, retornos e erros de cada endpoint. Zero código de cola, zero chance de drift entre spec e implementação.',
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
    meta: {
      description:
        'API REST pública com Hono, validação Zod, OpenAPI gerado do código, e SDK TypeScript publicado no npm.',
      image: coverImage.id,
      title: 'API REST com OpenAPI e SDK TypeScript | Kayro Gomes',
    },
  }
}
