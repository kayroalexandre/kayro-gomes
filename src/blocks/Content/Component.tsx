'use client'

import { cn } from '@/utilities/ui'
import React from 'react'
import { motion } from 'framer-motion'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'
import { easing } from '@/design-system/tokens/motion'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const colsSpanClasses: Record<string, string> = {
    full: 'col-span-4 lg:col-span-12',
    half: 'col-span-4 lg:col-span-6',
    oneThird: 'col-span-4 lg:col-span-4',
    twoThirds: 'col-span-4 lg:col-span-8',
  }

  return (
    <section className="container py-[var(--space-section-y)] md:py-[var(--space-section-y-lg)]">
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-16 gap-x-12">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, richText, size } = col

            return (
              <motion.div
                className={cn(
                  `${colsSpanClasses[size!] ?? 'col-span-4 lg:col-span-12'} flex flex-col gap-6`,
                  {
                    'md:col-span-2': size !== 'full',
                  },
                )}
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.1, duration: 0.6, ease: easing.smooth }}
              >
                {richText && (
                  <RichText
                    data={richText}
                    enableGutter={false}
                    className="prose-p:text-muted-foreground prose-p:leading-relaxed"
                  />
                )}

                {enableLink && <CMSLink {...link} className="self-start mt-2" />}
              </motion.div>
            )
          })}
      </div>
    </section>
  )
}
