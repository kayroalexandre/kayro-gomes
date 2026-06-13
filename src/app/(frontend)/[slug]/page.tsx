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
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const [{ isEnabled: draft }, { slug = 'home' }] = await Promise.all([
    draftMode(),
    paramsPromise,
  ])
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/' + decodedSlug
  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = (await queryDocBySlug({
    collection: 'pages',
    slug: decodedSlug,
  })) as RequiredDataFromCollectionSlug<'pages'> | null

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page
  const hasHero = hero && hero.type && hero.type !== 'none'

  return (
    <article className={`${hasHero ? 'pt-0' : 'pt-24'} pb-24`}>
      <PageHeaderTheme theme="light" />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const page = (await queryDocBySlug({
    collection: 'pages',
    slug: decodedSlug,
  })) as RequiredDataFromCollectionSlug<'pages'> | null

  return generateMeta({ doc: page })
}
