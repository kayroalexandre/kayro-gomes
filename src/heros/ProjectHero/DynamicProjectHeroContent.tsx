'use client'

import React from 'react'

import { useDynamicTextColor } from '@/utilities/useDynamicTextColor'
import { Icon } from '@/components/ui/icon'
import { ExternalLink } from 'lucide-react'

import { DynamicTechBadge } from './DynamicTechBadge'

interface DynamicProjectHeroContentProps {
  title: string
  summary?: string | null
  techList: string[]
  liveUrl?: string | null
  repoUrl?: string | null
}

/**
 * Conteúdo do ProjectHero com contraste dinâmico automático.
 * Componente client que usa useDynamicTextColor para ajustar cores de texto/ícones.
 */
export const DynamicProjectHeroContent: React.FC<DynamicProjectHeroContentProps> = ({
  title,
  summary,
  techList,
  liveUrl,
  repoUrl,
}) => {
  // Hook para o título e resumo (nível main)
  const { ref: titleRef, color: titleColor } = useDynamicTextColor('main')
  const { ref: summaryRef, color: summaryColor } = useDynamicTextColor('muted')

  // Hook para o CTA secundário (borda transparente, precisa de contraste dinâmico)
  const { ref: ctaSecondaryRef, color: ctaSecondaryColor } = useDynamicTextColor('main')

  // CTA primário (bg-white text-black) é intencionalmente invertido para destaque visual.
  // Não usa contraste dinâmico porque o fundo é controlado pelo próprio botão.

  return (
    <div className="col-start-1 col-span-1 md:col-start-2 md:col-span-2">
      <h1
        ref={titleRef as React.RefObject<HTMLHeadingElement>}
        className="mb-6 text-heading-lg md:text-title lg:text-title-lg"
        style={{ color: titleColor }}
      >
        {title}
      </h1>

      {summary && (
        <p
          ref={summaryRef as React.RefObject<HTMLParagraphElement>}
          className="text-body-lg max-w-2xl mb-6"
          style={{ color: summaryColor }}
        >
          {summary}
        </p>
      )}

      {techList.length > 0 && (
        <ul aria-label="Stack" className="flex flex-wrap gap-2 mb-8">
          {techList.map((t) => (
            <DynamicTechBadge key={t}>{t}</DynamicTechBadge>
          ))}
        </ul>
      )}

      {(liveUrl || repoUrl) && (
        <div className="flex flex-wrap gap-3">
          {liveUrl && (
            <a
              href={liveUrl}
              rel="noopener noreferrer"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-md bg-on-dark text-on-light px-4 py-2 text-body-sm font-medium hover:bg-on-dark/90"
            >
              Ver projeto <Icon icon={ExternalLink} size="sm" />
            </a>
          )}
          {repoUrl && (
            <a
              ref={ctaSecondaryRef as React.RefObject<HTMLAnchorElement>}
              href={repoUrl}
              rel="noopener noreferrer"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-md border border-on-dark/30 px-4 py-2 text-body-sm font-medium hover:bg-on-dark/10"
              style={{ color: ctaSecondaryColor }}
            >
              <svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55v-1.93c-3.2.7-3.88-1.54-3.88-1.54-.52-1.32-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.96.1-.75.4-1.26.72-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.83 1.18 3.09 0 4.43-2.7 5.4-5.27 5.68.41.36.78 1.07.78 2.16v3.2c0 .31.21.66.8.55C20.21 21.38 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5z" />
              </svg>
              Repositório
            </a>
          )}
        </div>
      )}
    </div>
  )
}
