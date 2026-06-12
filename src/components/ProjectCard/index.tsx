'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React from 'react'

import type { Project, Media } from '@/payload-types'

import { Media as MediaComponent } from '@/components/Media'
import { Card as ShadcnCard } from '@/components/ui/card'

export type ProjectCardData = Pick<
  Project,
  'slug' | 'title' | 'summary' | 'tech' | 'categories' | 'meta' | 'coverImage'
>

export const ProjectCard: React.FC<{
  className?: string
  project: ProjectCardData
}> = ({ className, project }) => {
  const { card, link } = useClickableCard({})
  const { slug, title, summary, tech, coverImage, meta } = project
  const coverFromMeta = typeof meta?.image === 'object' ? (meta.image as Media) : null
  const cover = coverImage || coverFromMeta

  const techList = Array.isArray(tech)
    ? (tech.map((t) => (typeof t === 'object' ? t?.name : t)).filter(Boolean) as string[])
    : []

  return (
    <ShadcnCard
      ref={card.ref as React.Ref<HTMLDivElement>}
      className={cn(
        'overflow-hidden hover:cursor-pointer flex flex-col h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-xl',
        className,
      )}
    >
      <div className="relative w-full aspect-video bg-muted/10">
        {cover && typeof cover !== 'string' && <MediaComponent resource={cover} size="50vw" />}
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="prose">
          <h3 className="text-xl font-bold leading-snug">
            <Link className="not-prose hover:underline" href={`/projetos/${slug}`} ref={link.ref}>
              {title}
            </Link>
          </h3>
        </div>
        {summary && <p className="text-sm text-muted-foreground line-clamp-3">{summary}</p>}
        {techList.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 mt-auto">
            {techList.slice(0, 5).map((t) => (
              <li
                key={t}
                className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
              >
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </ShadcnCard>
  )
}
