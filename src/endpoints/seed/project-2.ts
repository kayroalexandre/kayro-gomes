import type { Media } from '@/payload-types'
import { RequiredDataFromCollectionSlug } from 'payload'

export type ProjectArgs = {
  coverImage: Media
  blockImage: Media
}

/**
 * Project 2 — CLI em Node.js + TypeScript para automatizar a gestão de
 * branches de banco no Neon (criar, copiar, listar, dropar).
 */
export const project2: (args: ProjectArgs) => RequiredDataFromCollectionSlug<'projects'> = ({
  coverImage,
}) => {
  return {
    slug: 'neon-branch-cli',
    _status: 'published',
    title: 'CLI para gerenciar branches no Neon',
    summary:
      'Ferramenta de linha de comando em Node.js que automatiza o ciclo de vida de branches de banco no Neon: criar preview, copiar prod para dev, listar, dropar.',
    coverImage: coverImage.id,
    tech: [
      { name: 'Node.js 22' },
      { name: 'TypeScript' },
      { name: 'Commander' },
      { name: 'Neon HTTP API' },
      { name: 'Zod' },
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
                text: 'Antes desse CLI, cada vez que eu queria testar uma migration localmente eu abria o painel do Neon, clicava em "Create branch", copiava o connection string, colava no .env.local. Em 5 cliques. Para 10 migrations por semana, isso é meia hora perdida. Automatizei.',
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
                text: 'Comandos disponíveis',
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
            type: 'block',
            fields: {
              blockName: 'neon-branch --help',
              blockType: 'code',
              code: `Usage: neon-branch [options] [command]

Gerencia branches de banco no Neon via HTTP API.

Options:
  -V, --version            output the version number
  --api-key <key>          Neon API key (default: process.env.NEON_API_KEY)
  --project-id <id>        Neon project ID (default: process.env.NEON_PROJECT_ID)
  -h, --help               display help for command

Commands:
  list                     Lista todas as branches do projeto
  create <name>            Cria uma branch nova a partir de prod
  copy <from> <to>         Copia uma branch existente
  drop <name>              Apaga uma branch (com confirmação)
  url <name>               Imprime a connection string da branch
  reset <name>             Drop + recriar a branch (wipe state)`,
              language: 'bash',
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
                text: 'Por que Zod para validação',
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
                text: 'A API do Neon retorna JSONs grandes com nomenclatura em snake_case. Zod me dá type-safety no boundary do que vem de fora:',
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
              blockName: 'Branch schema',
              blockType: 'code',
              code: `import { z } from 'zod'

export const BranchSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  protected: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  // parent_id é null para branches raiz
  parent_id: z.string().uuid().nullable(),
  // ...
})

export type Branch = z.infer<typeof BranchSchema>

export async function listBranches(apiKey: string, projectId: string): Promise<Branch[]> {
  const res = await fetch(\`https://console.neon.tech/api/v2/projects/\${projectId}/branches\`, {
    headers: { Authorization: \`Bearer \${apiKey}\` },
  })
  
  if (!res.ok) {
    throw new Error(\`Neon API error: \${res.status} \${res.statusText}\`)
  }
  
  const json = await res.json()
  // Valida na borda — o que entra no resto do código é Branch tipado
  return z.array(BranchSchema).parse(json.branches)
}`,
              language: 'typescript',
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
                          text: 'O comando "reset" é o que mais uso: pnpm neon-branch reset dev — apaga minha branch dev, recria a partir de prod, e imprime a nova connection string. Em 3 segundos, sem sair do terminal.',
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
        'CLI em Node.js para automatizar o ciclo de vida de branches de banco no Neon: criar, copiar, listar, dropar e resetar.',
      image: coverImage.id,
      title: 'CLI para gerenciar branches no Neon | Kayro Gomes',
    },
  }
}
