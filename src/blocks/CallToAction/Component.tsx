import React from 'react'
import { motion } from 'framer-motion'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <section className="container py-16">
      <motion.div
        className="bg-card rounded-2xl border border-border p-8 md:p-12 flex flex-col gap-8 md:flex-row md:justify-between md:items-center shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-[48rem]">
          {richText && <RichText className="mb-0" data={richText} enableGutter={false} />}
        </div>
        <div className="flex flex-col gap-4 md:gap-3">
          {(links || []).map(({ link }, i) => {
            return <CMSLink key={i} size="lg" {...link} />
          })}
        </div>
      </motion.div>
    </section>
  )
}
