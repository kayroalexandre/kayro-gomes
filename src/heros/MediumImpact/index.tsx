'use client'

import React from 'react'
import { motion } from 'framer-motion'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { motion as motionTokens } from '@/design-system/tokens/motion'

export const MediumImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <section className="relative border-b border-border bg-background py-16 md:py-24">
      <div className="container">
        {/* RichText com tipografia consistente */}
        {richText && (
          <div className="max-w-4xl">
            <RichText className="mb-8" data={richText} enableGutter={false} />
          </div>
        )}

        {/* CTAs */}
        {Array.isArray(links) && links.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {links.map(({ link }, i) => {
              return <CMSLink key={i} {...link} />
            })}
          </motion.div>
        )}
      </div>

      {/* Media com animação sutil */}
      {media && typeof media === 'object' && (
        <div className="container mt-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: motionTokens.easing.smooth }}
          >
            <div className="-mx-4 md:-mx-8 2xl:-mx-16">
              <Media imgClassName="rounded-xl shadow-lg" priority resource={media} />
            </div>
            {media?.caption && (
              <div className="mt-4 text-body-sm text-muted-foreground">
                <RichText data={media.caption} enableGutter={false} />
              </div>
            )}
          </motion.div>
        </div>
      )}
    </section>
  )
}
