import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { PageHeaderTheme } from '@/components/PageHeaderTheme'
import { generateMeta } from '@/utilities/generateMeta'
import { queryDocBySlug } from '@/utilities/queryDocBySlug'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    where: {
      slug: {
        equals: 'posts',
      },
    },
    select: {
      slug: true,
    },
  })

  return pages.docs.map(({ slug }) => ({ slug }))
}

export default async function PostsPage() {
  const [{ isEnabled: draft }] = await Promise.all([draftMode()])
  const url = '/posts'
  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = (await queryDocBySlug({
    collection: 'pages',
    slug: 'posts',
  })) as RequiredDataFromCollectionSlug<'pages'> | null

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page
  const hasHero = hero && hero.type && hero.type !== 'none'

  return (
    <article className={`${hasHero ? 'pt-0' : 'pt-24'} pb-24`}>
      {hero?.type === 'highImpact' && <PageHeaderTheme theme="dark" />}

      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const page = (await queryDocBySlug({
    collection: 'pages',
    slug: 'posts',
  })) as RequiredDataFromCollectionSlug<'pages'> | null

  if (!page) {
    return {
      title: 'Blog — Kayro Gomes',
    }
  }

  return generateMeta({ doc: page })
}
