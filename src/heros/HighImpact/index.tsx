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
  scrollIndicator: scrollIndicatorProp,
}) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  const imgFitClass = heroImageFit === 'contain' ? 'object-contain' : 'object-cover'
  const scrollEnabled = scrollIndicatorProp?.enabled ?? true
  const scrollAtBottom = (scrollIndicatorProp?.position ?? 'bottom') === 'bottom'

  return (
    // A altura da hero é `100dvh - var(--adminbar-h)`, descontando a
    // AdminBar para que o conteúdo caiba **inteiro** na viewport
    // visível (sem precisar de scroll para ver a base da hero quando
    // logado no admin). O AdminBar publica `--adminbar-h` no <html>
    // via ResizeObserver (componente AdminBar); o body, por sua vez,
    // tem `padding-top: var(--adminbar-h)` que empurra o hero para
    // baixo da AdminBar. Descontar a mesma altura aqui faz o final
    // do hero coincidir com o final da viewport. Quando deslogado,
    // o fallback `0px` mantém a hero em 100dvh como antes.
    <section className="relative h-[calc(100dvh-var(--adminbar-h,0px))] overflow-hidden text-white">
      {/*
        Container do conteúdo da hero.
        - `mt-[var(--header-h)]` → margem superior igual à altura do
          header (5rem). A margem fica no container (não no primeiro
          filho) para que a intenção de "deslocar todo o bloco de
          conteúdo para baixo do header" fique clara.
        - `h-[calc(100%-var(--header-h))]` → altura do container = hero
          menos a margem. Total (`mt` + `h`) = altura da hero exata.
          A div filha nunca é maior que a hero. Sem `h-full` (que
          ignoraria a margem e overflowaria).
        - `py-16` → padding superior E inferior iguais (4rem cada,
          classe `p-16` do design system).
        - `justify-between` → apenas na posição "inline" distribui
          heading, CTAs e scroll com espaçamento igual. Na posição
          "bottom" (padrão), o container NÃO tem justify-between:
          o wrapper (heading+CTAs) usa `flex-1 justify-center` para
          centralizar o conteúdo, e o scroll indicator fica no
          limite inferior — a "cereja do bolo" sempre no final.
      */}
      <div className={`container relative z-10 px-4 text-center${scrollAtBottom ? ' h-full flex flex-col items-center' : ' mt-[var(--header-h)] flex h-[calc(100%-var(--header-h))] flex-col items-center py-16 justify-between'}`}>
        {scrollAtBottom ? (
          <>
            {/* Heading + CTAs — centralizados via flex-1 justify-center */}
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <div className="flex flex-col items-center">
                {richText && (
                  <motion.div
                    className="max-w-5xl"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    <RichText className="hero-rich-text" data={richText} enableGutter={false} />
                  </motion.div>
                )}
                {Array.isArray(links) && links.length > 0 && (
                  <motion.div
                    className="flex flex-wrap justify-center gap-4"
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
                className="pb-[calc(var(--spacing)*8)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <ScrollIndicator label="Role para explorar" />
              </motion.div>
            )}
          </>
        ) : (
          <>
            {richText && (
              <motion.div
                className="max-w-5xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <RichText className="hero-rich-text" data={richText} enableGutter={false} />
              </motion.div>
            )}
            {Array.isArray(links) && links.length > 0 && (
              <motion.div
                className="flex flex-wrap justify-center gap-4"
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
                      className="rounded-full font-medium"
                    />
                  )
                })}
              </motion.div>
            )}
            {/* Indicador de scroll (inline) */}
            {scrollEnabled && (
              <motion.div
                data-slot="scroll-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <ScrollIndicator label="Role para explorar" />
              </motion.div>
            )}
          </>
        )}
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
