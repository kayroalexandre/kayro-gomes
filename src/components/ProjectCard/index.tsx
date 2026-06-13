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
        'group overflow-hidden hover:cursor-pointer flex flex-col h-full border border-border bg-card rounded-[20px] transition-colors hover:border-border/80',
        className,
      )}
    >
      <div className="relative w-full aspect-video bg-muted/5 overflow-hidden border-b border-border/10">
        {cover && typeof cover !== 'string' && (
          <div className="transition-transform duration-500 group-hover:scale-105 h-full w-full">
            <MediaComponent resource={cover} size="50vw" />
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="text-lg md:text-xl font-bold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors">
          <Link className="hover:no-underline" href={`/projetos/${slug}`} ref={link.ref}>
            {title}
          </Link>
        </h3>
        {summary && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{summary}</p>}
        {techList.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 mt-auto">
            {techList.slice(0, 5).map((t) => (
              <li
                key={t}
                className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border/10 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5"
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
