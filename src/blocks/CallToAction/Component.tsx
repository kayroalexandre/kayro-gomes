'use client'

import React from 'react'
import { motion } from 'framer-motion'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { easing } from '@/design-system/tokens/motion'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <section className="container py-16 md:py-24">
      <motion.div
        className="bg-card rounded-panel border border-border/50 p-10 md:p-16 flex flex-col gap-10 md:flex-row md:justify-between md:items-center shadow-lg shadow-black/20"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: easing.smooth }}
      >
        <div className="max-w-[48rem] prose-h2:text-title-sm md:prose-h2:text-title prose-h2:mb-4 prose-p:text-body-lg prose-p:text-muted-foreground">
          {richText && <RichText className="mb-0" data={richText} enableGutter={false} />}
        </div>
        <div className="flex flex-col gap-4 md:gap-3 shrink-0">
          {(links || []).map(({ link }, i) => {
            return <CMSLink key={i} size="lg" {...link} />
          })}
        </div>
      </motion.div>
    </section>
  )
}
