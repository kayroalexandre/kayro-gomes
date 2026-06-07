import { cn } from '@/utilities/ui'
import React from 'react'

import { ProjectCard, type ProjectCardData } from '@/components/ProjectCard'

export type Props = {
  projects: ProjectCardData[]
  className?: string
}

export const ProjectGrid: React.FC<Props> = ({ projects, className }) => {
  return (
    <div className={cn('container', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8">
        {projects?.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  )
}
