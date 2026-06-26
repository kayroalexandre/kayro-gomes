import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import RichText from '@/components/RichText'
import { draftMode } from 'next/headers'
import { LivePreviewListener } from '@/components/LivePreviewListener'

import type { Project } from '@/payload-types'

import { ProjectHero } from '@/heros/ProjectHero'
import { PageHeaderTheme } from '@/components/PageHeaderTheme'
import { generateMeta } from '@/utilities/generateMeta'
import { queryDocBySlug } from '@/utilities/queryDocBySlug'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const projects = await payload.find({
    collection: 'projects',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return projects.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function ProjectPage({ params: paramsPromise }: Args) {
  const [{ isEnabled: draft }, { slug = '' }] = await Promise.all([draftMode(), paramsPromise])
  const decodedSlug = decodeURIComponent(slug)
  const url = '/projetos/' + decodedSlug
  const project = (await queryDocBySlug({
    collection: 'projects',
    slug: decodedSlug,
  })) as Project | null

  if (!project) return <PayloadRedirects url={url} />

  return (
    <article className="pt-0 pb-16">
      {/* ProjectHero tem mídia de fundo escura (igual ao PostHero): força o header
          em tema dark para o contraste do logo/nav sobre a imagem. */}
      <PageHeaderTheme theme="dark" />

      {/* Allows redirects for valid projects too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <ProjectHero project={project} />

      <div className="flex flex-col items-center pt-16">
        <div className="container">
          {project.content && (
            <RichText
              className="max-w-[48rem] mx-auto"
              data={project.content}
              enableGutter={false}
            />
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const project = (await queryDocBySlug({
    collection: 'projects',
    slug: decodedSlug,
  })) as Project | null

  return generateMeta({ doc: project, pathOverride: `/projetos/${decodedSlug}` })
}
