import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { PageHeaderTheme } from '@/components/PageHeaderTheme'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { notFound } from 'next/navigation'

export const revalidate = 600

const POSTS_PER_PAGE = 12

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)

  // Page numbers devem ser inteiros >= 1; qualquer outra coisa é 404.
  if (!Number.isInteger(sanitizedPageNumber) || sanitizedPageNumber < 1) notFound()

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: POSTS_PER_PAGE,
    page: sanitizedPageNumber,
    overrideAccess: false,
  })

  // Página pedida está além do total de páginas existentes.
  if (posts.totalPages > 0 && sanitizedPageNumber > posts.totalPages) notFound()

  return (
    <div className="py-[var(--space-section-y)] md:py-[var(--space-section-y-lg)]">
      <PageHeaderTheme theme="light" />
      <div className="container mb-12">
        <h1 className="text-title-sm md:text-title font-extrabold tracking-tight mb-4 text-foreground">Blog</h1>
        <p className="text-body-lg text-muted-foreground max-w-2xl">
          Compartilhando aprendizados, tutoriais e reflexões sobre engenharia de software e desenvolvimento web.
        </p>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={POSTS_PER_PAGE}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        {posts?.page && posts?.totalPages > 1 && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  const page = Number(pageNumber)
  return {
    alternates: {
      canonical: Number.isInteger(page) && page >= 1 ? `/posts/page/${page}` : '/posts',
    },
    title: `Blog — página ${pageNumber || ''} | Kayro Gomes`,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / POSTS_PER_PAGE)

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
