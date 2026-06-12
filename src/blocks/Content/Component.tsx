'use client'

import { cn } from '@/utilities/ui'
import React from 'react'
import { motion } from 'framer-motion'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <section className="container py-24 md:py-32">
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-16 gap-x-12">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, richText, size } = col

            return (
              <motion.div
                className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]} flex flex-col gap-6`, {
                  'md:col-span-2': size !== 'full',
                })}
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {richText && <RichText data={richText} enableGutter={false} className="prose-h2:text-3xl prose-h2:font-normal prose-h2:tracking-tight prose-h3:text-2xl prose-p:text-muted-foreground prose-p:leading-relaxed" />}

                {enableLink && <CMSLink {...link} className="self-start mt-2" />}
              </motion.div>
            )
          })}
      </div>
    </section>
  )
}
