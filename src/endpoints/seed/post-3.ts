import { RequiredDataFromCollectionSlug } from 'payload'
import type { PostArgs } from './post-1'

/**
 * Post 3 — Server Components no Next.js 15: o que mudou na prática.
 * Demonstra: banner de aviso, headings, rich text, code, mediaBlock.
 * Categorizado como "Frontend" e "Reflexões".
 */
export const post3: (args: PostArgs) => RequiredDataFromCollectionSlug<'posts'> = ({
  heroImage,
  blockImage,
  author,
}) => {
  return {
    slug: 'server-components-nextjs-15',
    _status: 'published',
    authors: [author],
    content: {
      root: {
        type: 'root',
        children: [
          {
            type: 'block',
            fields: {
              blockName: 'Aviso de opinião',
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
                          text: 'Texto opinativo: ',
                          version: 1,
                        },
                        {
                          type: 'text',
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: 'o que vem a seguir é minha leitura depois de 6 meses com Next.js 15 em produção. Se discordar, me chama no GitHub Issues do projeto.',
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
              style: 'warning',
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
                text: 'O que mudou de verdade no 15',
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
                text: 'Muita gente ainda acha que React Server Components é "o Next faz a query no servidor". Não é — é mais profundo. RSC muda o que conta como estado, o que conta como fetch, e o que conta como "render". Server Components rodam uma vez no servidor e enviam uma árvore serializada pro browser, sem JS hidratado desnecessário.',
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
                text: 'No 15, três mudanças foram sentidas de verdade no meu dia a dia:',
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
                text: '1. async params e searchParams',
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
                text: 'Não é mais um objeto — é uma Promise. Toda página que recebia slug agora precisa de await. Parece pequeno, mas simplifica a coexistência com Suspense e elimina uma classe inteira de bugs onde devs tentavam tratar params como síncrono e quebravam em produção.',
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
              blockName: 'app/posts/[slug]/page.tsx',
              blockType: 'code',
              code: `type Args = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PostPage({ params, searchParams }: Args) {
  const { slug } = await params
  const { ref } = await searchParams
  const post = await getPostBySlug(slug)
  return <PostArticle post={post} ref={ref} />
}`,
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
                text: '2. fetch cache mudou de default',
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
                text: 'fetch() em Server Components agora é cacheado por padrão, não no-store como era no 14. Isso é uma grande mudança: significa que chamar a mesma URL duas vezes na mesma renderização não dispara duas requests. Para o Payload, isso ajudou muito — múltiplas queries no mesmo post reaproveitam a cache.',
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
                text: '3. Server Actions ficaram estáveis',
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
                text: 'Actions para mutação via form direto no server, sem API route, sem JS no client. O caso de uso que me pegou: o formulário de contato deste site. Antes: API route + fetch no client + loading state + error handling. Agora: <form action={submitContactForm}> e o Next faz o resto.',
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
              blockName: 'contato form',
              blockType: 'code',
              code: `// app/(frontend)/contato/page.tsx
async function submitContactForm(formData: FormData) {
  'use server'
  const submission = await payload.create({
    collection: 'form-submissions',
    data: {
      form: contactFormId,
      submissionData: Object.fromEntries(formData),
    },
  })
  revalidatePath('/contato')
  redirect('/contato?enviado=1')
}

export default function ContatoPage() {
  return (
    <form action={submitContactForm} className="space-y-4">
      <input name="full-name" required placeholder="Seu nome" />
      <input name="email" type="email" required placeholder="Seu e-mail" />
      <textarea name="message" required placeholder="Sua mensagem" />
      <button type="submit">Enviar</button>
    </form>
  )
}`,
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
                text: 'O que ainda me incomoda',
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
                text: 'O debug de Server Components ainda é pior que Client Components. O error stack aponta para o arquivo compilado, não pro source. A mensagem de erro às vezes esconde a query que falhou. Tudo melhor que em 2023, mas ainda me faz perder 30 min por semana.',
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
              blockName: 'Conclusão',
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
                          text: 'Server Components são o futuro do React web. Ainda tem fricção (debug, error messages, curva de aprendizado), mas os ganhos em performance e DX são reais. Se você está começando um projeto novo em 2026, RSC não é mais opcional — é o caminho padrão.',
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
        'async params, fetch cache, Server Actions: o que mudou no Next.js 15 e o que isso significa na prática.',
      image: heroImage.id,
      title: 'Server Components no Next.js 15: o que mudou na prática',
    },
    relatedPosts: [],
    title: 'Server Components no Next.js 15: o que mudou na prática',
  }
}
