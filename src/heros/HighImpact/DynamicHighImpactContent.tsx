'use client'

import React from 'react'

import { motion } from 'framer-motion'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import { ScrollIndicator } from '@/components/ui/scroll-indicator'
import { easing } from '@/design-system/tokens/motion'

interface DynamicHighImpactContentProps {
  richText?: Page['hero']['richText']
  links?: Page['hero']['links']
  scrollEnabled: boolean
  scrollAtBottom: boolean
}

/**
 * Conteúdo do HighImpactHero.
 * HighImpactHero sempre tem foto de fundo escura, então o texto é fixo em branco.
 */
export const DynamicHighImpactContent: React.FC<DynamicHighImpactContentProps> = ({
  richText,
  links,
  scrollEnabled,
  scrollAtBottom,
}) => {
  return (
    <>
      {/* Heading + CTAs — centralizados via flex-1 justify-center */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="flex flex-col items-center">
          {richText && (
            <motion.div
              className="max-w-5xl text-on-dark"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: easing.emphasized }}
            >
              <RichText
                className="hero-rich-text"
                data={richText}
                enableGutter={false}
                enableProse={false}
              />
            </motion.div>
          )}
          {Array.isArray(links) && links.length > 0 && (
            <motion.div
              className="flex flex-wrap justify-center gap-4 mt-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: easing.emphasized }}
            >
              {links.map(({ link }, i) => {
                const appearance = i === 0 ? 'default' : 'outline'
                return (
                  <CMSLink
                    key={i}
                    {...link}
                    appearance={appearance}
                    size="lg"
                    className="rounded-full font-medium"
                  />
                )
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Indicador de scroll — fixo no rodapé */}
      {scrollEnabled && (
        <motion.div
          data-slot="scroll-indicator"
          className={`text-on-dark-muted ${scrollAtBottom ? 'pb-[calc(var(--spacing)*8)]' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <ScrollIndicator label="Role para explorar" variant="muted" />
        </motion.div>
      )}
    </>
  )
}
