import type { Metadata } from 'next/types'

import { ProjectCard, type ProjectCardData } from '@/components/ProjectCard'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const projects = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    sort: '-publishedAt',
    select: {
      title: true,
      slug: true,
      summary: true,
      tech: true,
      coverImage: true,
      categories: true,
      meta: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Projetos</h1>
          <p className="text-muted-foreground">
            Aplicações, sites e bibliotecas que construí. Cada um com seu stack, contexto e o que aprendi no caminho.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8">
          {(projects.docs as unknown as ProjectCardData[]).map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Projetos — Kayro Gomes`,
  }
}
