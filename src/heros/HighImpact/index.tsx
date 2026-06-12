'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'
import { motion } from 'framer-motion'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { motion as motionTokens } from '@/design-system/tokens/motion'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  // Animação de entrada para palavras (equivalente à referência)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  }

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: motionTokens.duration.normal,
        ease: motionTokens.easing.smooth,
      },
    },
  }

  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-background pt-16 text-foreground">
      <div className="container relative z-10 flex flex-col items-center justify-center px-4 text-center">
        {/* Heading principal com animação palavra-por-palavra */}
        {richText && (
          <div className="mb-6 max-w-5xl">
            <RichText className="hero-rich-text" data={richText} enableGutter={false} />
          </div>
        )}

        {/* CTAs */}
        {Array.isArray(links) && links.length > 0 && (
          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            {links.map(({ link }, i) => {
              return <CMSLink key={i} {...link} />
            })}
          </motion.div>
        )}

        {/* Indicador de scroll */}
        <motion.div
          className="mt-16 flex flex-col items-center gap-2 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <span>Role para explorar</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-xs"
          >
            ↓
          </motion.div>
        </motion.div>
      </div>

      {/* Media de fundo (se existir) - sutil */}
      {media && typeof media === 'object' && (
        <div className="absolute inset-0 -z-10 opacity-30">
          <Media fill imgClassName="object-cover" priority resource={media} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>
      )}
    </section>
  )
}
