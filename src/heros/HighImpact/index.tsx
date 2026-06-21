'use client'

import React from 'react'

import type { Page } from '@/payload-types'

import { Media } from '@/components/Media'
import { DynamicHighImpactContent } from './DynamicHighImpactContent'

export const HighImpactHero: React.FC<Page['hero']> = ({
  links,
  media,
  richText,
  overlayEnabled,
  overlayOpacity,
  heroImageFit,
  scrollIndicator: scrollIndicatorProp,
}) => {
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
    <section className="relative h-[calc(100dvh-var(--adminbar-h,0px))] overflow-hidden">
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
        - Layout interno: `justify-between` distribui conteúdo e indicador.
      */}
      <div className="container relative z-10 px-4 text-center mt-[var(--header-h)] flex h-[calc(100%-var(--header-h))] flex-col items-center justify-between py-16">
        <DynamicHighImpactContent
          richText={richText}
          links={links}
          scrollEnabled={scrollEnabled}
          scrollAtBottom={scrollAtBottom}
        />
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
        </div>
      )}
    </section>
  )
}
