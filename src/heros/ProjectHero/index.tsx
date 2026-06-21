import React from 'react'

import type { Project } from '@/payload-types'

import { Media } from '@/components/Media'
import { HeroOverlay } from '@/components/ui/hero-overlay'

import { DynamicProjectHeroContent } from './DynamicProjectHeroContent'

export const ProjectHero: React.FC<{
  project: Project
}> = ({ project }) => {
  const { title, summary, tech, liveUrl, repoUrl, coverImage } = project

  const techList = Array.isArray(tech)
    ? (tech.map((t) => (typeof t === 'object' ? t?.name : t)).filter(Boolean) as string[])
    : []

  return (
    <header className="relative min-h-[80vh] flex items-end">
      <div className="container z-10 relative lg:grid lg:grid-cols-[1fr_48rem_1fr] pb-8 mt-[var(--header-h)]">
        <DynamicProjectHeroContent
          title={title}
          summary={summary}
          techList={techList}
          liveUrl={liveUrl}
          repoUrl={repoUrl}
        />
      </div>
      <div className="absolute inset-0 select-none z-0">
        {coverImage && typeof coverImage !== 'string' && (
          <Media fill priority imgClassName="object-cover" resource={coverImage} />
        )}
        <HeroOverlay opacity={40} bottomFade />
      </div>
    </header>
  )
}
