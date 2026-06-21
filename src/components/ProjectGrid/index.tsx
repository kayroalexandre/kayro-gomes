'use client'
import { cn } from '@/utilities/ui'
import React from 'react'
import { motion } from 'framer-motion'

import { ProjectCard, type ProjectCardData } from '@/components/ProjectCard'
import { easing } from '@/design-system/tokens/motion'

export type Props = {
  projects: ProjectCardData[]
  className?: string
}

export const ProjectGrid: React.FC<Props> = ({ projects, className }) => {
  return (
    <div className={cn('container', className)}>
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6 lg:gap-y-10 lg:gap-x-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {projects?.map((project) => (
          <motion.div 
            key={project.slug}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing.smooth } }
            }}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
