import type { Media } from '@/payload-types'
import { RequiredDataFromCollectionSlug } from 'payload'

export type ProjectArgs = {
  coverImage: Media
  blockImage: Media
}

/**
 * Project 1 — Plataforma de e-commerce completa com painel admin,
 * checkout, e gestão de estoque. Demonstra: rich text, headings, code
 * block, banner block, tech stack e links de demo/repo.
 */
export const project1: (args: ProjectArgs) => RequiredDataFromCollectionSlug<'projects'> = ({
  coverImage,
  blockImage,
}) => {
  return {
    slug: 'ecommerce-payload-nextjs',
    _status: 'published',
    title: 'E-commerce full-stack com Payload CMS',
    summary:
      'Loja virtual completa com catálogo, carrinho persistente, checkout integrado e painel admin customizado para gestão de produtos e pedidos.',
    coverImage: coverImage.id,
    tech: [
      { name: 'Next.js 15' },
      { name: 'Payload CMS 3' },
      { name: 'TypeScript' },
      { name: 'Postgres' },
      { name: 'Stripe' },
      { name: 'Tailwind CSS' },
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
                text: 'Construí essa loja para explorar como Payload CMS 3 lida com collections relacionais complexas (Products → Variants → Inventory → Orders). O Next.js 15 entra no checkout com Server Actions para mutações, e o Stripe Elements para o pagamento real. Tudo tipado end-to-end com TypeScript estrito.',
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
                text: 'Decisões de arquitetura',
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
                text: 'Optei por manter o carrinho no servidor (via cookie httpOnly + Postgres) em vez de localStorage. Sacrifica um pouco de performance no primeiro add-to-cart, mas garante que o carrinho sobrevive a logout, troca de dispositivo e tem o estoque checado em tempo real.',
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
              blockName: 'Por que Postgres e não SQLite',
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
                          text: 'Em produção, e-commerce precisa de concorrência real no estoque. Dois clientes comprando a última unidade ao mesmo tempo não pode resultar em oversell. Postgres com SELECT FOR UPDATE resolve isso nativo; SQLite precisaria de lock no nível da aplicação.',
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
            type: 'block',
            fields: {
              blockName: 'checkout action',
              blockType: 'code',
              code: `'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'

export async function addToCart(productId: string, variantId: string) {
  const cookieStore = await cookies()
  const cartId = cookieStore.get('cart-id')?.value
  
  const payload = await getPayload({ config })
  
  // Cria o cart se não existir, com transação
  const cart = await payload.db.executeTransaction(async (tx) => {
    // ... lógica com SELECT FOR UPDATE
  })
  
  cookieStore.set('cart-id', String(cart.id), { httpOnly: true, sameSite: 'lax' })
  return { success: true, cartId: cart.id }
}`,
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
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'O que vem depois',
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
                text: 'Próximo passo é adicionar busca facetada no catálogo (por preço, categoria, tags) usando o índice GIN do Postgres, e webhooks do Stripe para reconciliação de pagamento em caso de retry do cliente.',
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
    meta: {
      description:
        'E-commerce completo com Payload CMS, Next.js 15, Postgres e Stripe. Catálogo, carrinho persistente, checkout e painel admin.',
      image: coverImage.id,
      title: 'E-commerce full-stack com Payload CMS | Kayro Gomes',
    },
  }
}
