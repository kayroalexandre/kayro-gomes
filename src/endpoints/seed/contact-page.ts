import type { Form } from '@/payload-types'
import { RequiredDataFromCollectionSlug } from 'payload'

type ContactArgs = {
  contactForm: Form
}

/**
 * Página /contato — formulário de contato simples.
 * Sem hero, todo o conteúdo fica no formBlock (com intro em PT-BR).
 */
export const contact: (args: ContactArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  contactForm,
}) => {
  return {
    slug: 'contato',
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
                  text: 'Contato',
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
                  text: 'Tem um projeto, ideia ou só quer trocar uma ideia? Manda mensagem — respondo em até 2 dias úteis.',
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
      {
        blockType: 'formBlock',
        enableIntro: true,
        form: contactForm,
        introContent: {
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
                    text: 'Envie uma mensagem',
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
                    text: 'Preencha os campos abaixo. As mensagens são salvas no CMS e me chegam por e-mail. Se preferir, me chama direto no ',
                    version: 1,
                  },
                  {
                    type: 'link',
                    children: [
                      {
                        type: 'text',
                        detail: 0,
                        format: 0,
                        mode: 'normal',
                        style: '',
                        text: 'GitHub',
                        version: 1,
                      },
                    ],
                    direction: 'ltr',
                    fields: {
                      linkType: 'custom',
                      newTab: true,
                      url: 'https://github.com/kayroalexandre',
                    },
                    format: '',
                    indent: 0,
                    version: 3,
                  },
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: ' ou ',
                    version: 1,
                  },
                  {
                    type: 'link',
                    children: [
                      {
                        type: 'text',
                        detail: 0,
                        format: 0,
                        mode: 'normal',
                        style: '',
                        text: 'LinkedIn',
                        version: 1,
                      },
                    ],
                    direction: 'ltr',
                    fields: {
                      linkType: 'custom',
                      newTab: true,
                      url: 'https://linkedin.com/in/kayroalexandre',
                    },
                    format: '',
                    indent: 0,
                    version: 3,
                  },
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: '.',
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
    ],
    meta: {
      description: 'Entre em contato com Kayro Gomes para projetos, freelas ou troca de ideias sobre desenvolvimento web.',
      title: 'Contato — Kayro Gomes',
    },
    title: 'Contato',
  }
}
