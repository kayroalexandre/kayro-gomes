import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageHeaderTheme } from '@/components/PageHeaderTheme'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import type { CardPostData } from '@/components/Card'

type Args = {
  searchParams: Promise<{
    q: string
  }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: rawQuery } = await searchParamsPromise
  // Decodifica o termo buscado (caso venha URL-encoded do componente de Search)
  // e limita tamanho para evitar queries absurdas.
  const query = rawQuery ? decodeURIComponent(rawQuery).slice(0, 100) : ''
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 12,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
    // pagination: false reduces overhead if you don't need totalDocs
    pagination: false,
    ...(query
      ? {
          where: {
            or: [
              {
                title: {
                  like: query,
                },
              },
              {
                'meta.description': {
                  like: query,
                },
              },
              {
                'meta.title': {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  })

  return (
    <div className="pt-24 pb-24">
      <PageHeaderTheme theme="light" />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">Busca</h1>

          <div className="max-w-[50rem] mx-auto">
            <Search />
          </div>
        </div>
      </div>

      {posts.docs.length > 0 ? (
        <CollectionArchive posts={posts.docs as unknown as CardPostData[]} />
      ) : (
        <div className="container">
          <div className="text-center py-16 px-4 border border-dashed rounded-lg bg-card/20 max-w-[50rem] mx-auto">
            <p className="text-muted-foreground text-lg">
              {query
                ? `Nenhum resultado encontrado para "${query}".`
                : 'Nenhum resultado encontrado.'}
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Tente pesquisar com outros termos ou palavras-chave.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export async function generateMetadata({ searchParams: searchParamsPromise }: Args): Promise<Metadata> {
  const { q } = await searchParamsPromise
  const query = q ? decodeURIComponent(q) : ''
  return {
    alternates: { canonical: '/search' },
    title: query ? `Busca por "${query}" — Kayro Gomes` : 'Busca — Kayro Gomes',
  }
}
