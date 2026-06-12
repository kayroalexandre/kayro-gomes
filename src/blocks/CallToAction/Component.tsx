'use client'

import React from 'react'
import { motion } from 'framer-motion'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <section className="container py-24 md:py-32">
      <motion.div
        className="bg-card rounded-[32px] border border-border/50 p-10 md:p-16 flex flex-col gap-10 md:flex-row md:justify-between md:items-center shadow-lg shadow-black/20"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="max-w-[48rem] prose-h2:text-4xl md:prose-h2:text-5xl prose-h2:font-normal prose-h2:tracking-tight prose-h2:mb-4 prose-p:text-lg prose-p:text-muted-foreground">
          {richText && <RichText className="mb-0" data={richText} enableGutter={false} />}
        </div>
        <div className="flex flex-col gap-4 md:gap-3 shrink-0">
          {(links || []).map(({ link }, i) => {
            return <CMSLink key={i} size="lg" className="rounded-full px-8" {...link} />
          })}
        </div>
      </motion.div>
    </section>
  )
}
