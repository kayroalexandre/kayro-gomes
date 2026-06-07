import { RequiredDataFromCollectionSlug } from 'payload'

/**
 * Página /sobre — "Sobre mim" completa, com bio longa, skills e timeline
 * de experiência. Sem imagem de hero (lowImpact, só texto), porque
 * a força da página é a escrita.
 */
export const sobre: () => RequiredDataFromCollectionSlug<'pages'> = () => {
  return {
    slug: 'sobre',
    _status: 'published',
    hero: {
      type: 'lowImpact',
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
                  text: 'Sobre mim',
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
                  text: 'Quem está por trás deste site, como eu trabalho, e o que me move.',
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
      // ── 1. Bio principal ────────────────────────────────────
      {
        blockName: 'Bio',
        blockType: 'content',
        columns: [
          {
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Quem sou', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, tag: 'h2', version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        detail: 0, format: 0, mode: 'normal', style: '',
                        text: 'Meu nome é Kayro, sou brasileiro e trabalho com desenvolvimento de software desde 2018. Comecei com PHP e WordPress, fui pro Node, depois React, e desde 2022 mergulhei fundo no ecossistema Next.js. Hoje trabalho principalmente como full-stack — escrevo o front, o back, o schema do banco, e às vezes configuro o CI.',
                        version: 1,
                      },
                    ],
                    direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        detail: 0, format: 0, mode: 'normal', style: '',
                        text: 'Amo o trabalho de "do papel ao deploy" — pegar uma ideia solta e transformar em software que roda em produção, com monitoramento, testes e tudo que tem direito. Mas também curto sentar com o time pra desenhar a arquitetura antes da primeira linha de código existir.',
                        version: 1,
                      },
                    ],
                    direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1,
                  },
                ],
                direction: 'ltr', format: '', indent: 0, version: 1,
              },
            },
            size: 'full',
          },
        ],
      },
      // ── 2. O que eu faço (3 colunas) ────────────────────────
      {
        blockName: 'O que eu faço',
        blockType: 'content',
        columns: [
          {
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Aplicações web', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, tag: 'h3', version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'SaaS, MVPs, dashboards. Foco em performance, SEO e experiência de edição. Stack típica: Next.js + TypeScript + Postgres.', version: 1 }],
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
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Sites e portais', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, tag: 'h3', version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Sites institucionais, blogs, portfólios com CMS headless. Integração com Payload, Sanity ou Contentful. SEO técnico incluído.', version: 1 }],
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
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Consultoria e mentoria', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, tag: 'h3', version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Code review, escolha de stack, setup de CI/CD, migração de monolito para Next.js. Sessões de 1h ou acompanhamento semanal.', version: 1 }],
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
      // ── 3. Princípios de trabalho ────────────────────────────
      {
        blockName: 'Princípios',
        blockType: 'content',
        columns: [
          {
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Princípios que sigo', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, tag: 'h2', version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [
                      {
                        type: 'text',
                        detail: 0, format: 0, mode: 'normal', style: '',
                        text: 'Não é checklist moral — é o que funciona melhor pra mim e pros times com que trabalhei. Tudo é negociável se o contexto pedir outra coisa.',
                        version: 1,
                      },
                    ],
                    direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1,
                  },
                ],
                direction: 'ltr', format: '', indent: 0, version: 1,
              },
            },
            size: 'full',
          },
          {
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Premature optimization é o root of all evil', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, tag: 'h3', version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Escrevo código simples e direto. Otimizo quando o profiling mostra que precisa. Não antes.', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1,
                  },
                ],
                direction: 'ltr', format: '', indent: 0, version: 1,
              },
            },
            size: 'half',
          },
          {
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Boring tech, when possible', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, tag: 'h3', version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Prefiro Postgres + Next.js + Vercel a montar uma stack exótica. Funciona, tem documentação, tem gente pra contratar.', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1,
                  },
                ],
                direction: 'ltr', format: '', indent: 0, version: 1,
              },
            },
            size: 'half',
          },
          {
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Documentação é código', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, tag: 'h3', version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'README vale tanto quanto teste. Decisões de arquitetura vão pro docs/, não pra cabeça do dev sênior que vai sair do projeto em 6 meses.', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1,
                  },
                ],
                direction: 'ltr', format: '', indent: 0, version: 1,
              },
            },
            size: 'half',
          },
          {
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Feedback cedo é melhor que feedback tarde', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, tag: 'h3', version: 1,
                  },
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Subo PRs pequenos, peço review cedo, prefiro a vergonha de um bug em staging ao silêncio de um bug em produção por 3 meses.', version: 1 }],
                    direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1,
                  },
                ],
                direction: 'ltr', format: '', indent: 0, version: 1,
              },
            },
            size: 'half',
          },
        ],
      },
      // ── 4. CTA final ─────────────────────────────────────────
      {
        blockName: 'Vamos conversar',
        blockType: 'cta',
        links: [
          {
            link: {
              type: 'custom',
              appearance: 'default',
              label: 'Mandar mensagem',
              url: '/contato',
            },
          },
        ],
        richText: {
          root: {
            type: 'root',
            children: [
              {
                type: 'heading',
                children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Vamos colocar isso em prática?', version: 1 }],
                direction: 'ltr', format: '', indent: 0, tag: 'h2', version: 1,
              },
              {
                type: 'paragraph',
                children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: 'Se você chegou até aqui, está claro que a gente pode se dar bem. Me conta o que você precisa.', version: 1 }],
                direction: 'ltr', format: '', indent: 0, textFormat: 0, version: 1,
              },
            ],
            direction: 'ltr', format: '', indent: 0, version: 1,
          },
        },
      },
    ],
    meta: {
      description: 'Sobre Kayro Gomes — desenvolvedor full-stack brasileiro. Bio, princípios de trabalho, e como contratar.',
      title: 'Sobre — Kayro Gomes',
    },
    title: 'Sobre',
  }
}
