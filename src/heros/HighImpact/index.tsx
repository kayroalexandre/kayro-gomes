'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'
import { motion } from 'framer-motion'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { ScrollIndicator } from '@/components/ui/scroll-indicator'

export const HighImpactHero: React.FC<Page['hero']> = ({
  links,
  media,
  richText,
  overlayEnabled,
  overlayOpacity,
  bottomFadeEnabled,
  heroImageFit,
}) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  const imgFitClass = heroImageFit === 'contain' ? 'object-contain' : 'object-cover'

  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden text-white">
      <div className="container relative z-10 flex flex-col items-center justify-center px-4 text-center">
        {/* Heading principal com animação de entrada premium */}
        {richText && (
          <motion.div
            className="mb-6 max-w-5xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <RichText className="hero-rich-text" data={richText} enableGutter={false} />
          </motion.div>
        )}

        {/* CTAs */}
        {Array.isArray(links) && links.length > 0 && (
          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {links.map(({ link }, i) => {
              const appearance = i === 0 ? 'default' : 'outline'
              return (
                <CMSLink
                  key={i}
                  {...link}
                  appearance={appearance}
                  size="lg"
                  className="rounded-full font-sans font-medium"
                />
              )
            })}
          </motion.div>
        )}

        {/* Indicador de scroll */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <ScrollIndicator label="Role para explorar" />
        </motion.div>
      </div>

      {/* Media de fundo (se existir) */}
      {media && typeof media === 'object' && (
        <div className="absolute inset-0 z-0">
          <Media fill imgClassName={imgFitClass} priority resource={media} />
          {/* Overlay escuro controlado pelo CMS */}
          {overlayEnabled && (
            <div
              className="absolute inset-0 bg-background"
              style={{ opacity: (overlayOpacity ?? 60) / 100 }}
            />
          )}
          {bottomFadeEnabled !== false && (
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          )}
        </div>
      )}
    </section>
  )
}
