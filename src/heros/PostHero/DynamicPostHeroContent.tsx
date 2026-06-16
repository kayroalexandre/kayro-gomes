'use client'

import React from 'react'

import { useDynamicTextColor } from '@/utilities/useDynamicTextColor'

import { formatDateTime } from '@/utilities/formatDateTime'
import { formatAuthors } from '@/utilities/formatAuthors'

import type { Post } from '@/payload-types'

interface DynamicPostHeroContentProps {
  post: Post
}

/**
 * Conteúdo do PostHero com contraste dinâmico automático.
 * Componente client que usa useDynamicTextColor para ajustar cores de texto.
 */
export const DynamicPostHeroContent: React.FC<DynamicPostHeroContentProps> = ({ post }) => {
  const { categories, populatedAuthors, publishedAt, title } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  // Hooks para contraste dinâmico
  const { ref: categoryRef, color: categoryColor } = useDynamicTextColor('subtle')
  const { ref: titleRef, color: titleColor } = useDynamicTextColor('main')
  const { ref: labelRef, color: labelColor } = useDynamicTextColor('subtle')
  const { ref: valueRef, color: valueColor } = useDynamicTextColor('main')

  return (
    <div className="col-start-1 col-span-1 md:col-start-2 md:col-span-2">
      <div
        ref={categoryRef as React.RefObject<HTMLDivElement>}
        className="text-sm mb-6"
        style={{ color: categoryColor }}
      >
        {categories?.map((category, index) => {
          if (typeof category === 'object' && category !== null) {
            const { title: categoryTitle } = category
            const titleToUse = categoryTitle || 'Untitled category'
            const isLast = index === categories.length - 1

            return (
              <React.Fragment key={index}>
                {titleToUse}
                {!isLast && <React.Fragment>, &nbsp;</React.Fragment>}
              </React.Fragment>
            )
          }
          return null
        })}
      </div>

      <div className="">
        <h1
          ref={titleRef as React.RefObject<HTMLHeadingElement>}
          className="mb-6 text-3xl md:text-5xl lg:text-6xl"
          style={{ color: titleColor }}
        >
          {title}
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-16">
        {hasAuthors && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p
                ref={labelRef as React.RefObject<HTMLParagraphElement>}
                className="text-sm"
                style={{ color: labelColor }}
              >
                Autor
              </p>
              <p
                ref={valueRef as React.RefObject<HTMLParagraphElement>}
                className="font-medium"
                style={{ color: valueColor }}
              >
                {formatAuthors(populatedAuthors)}
              </p>
            </div>
          </div>
        )}
        {publishedAt && (
          <div className="flex flex-col gap-1">
            <p
              ref={labelRef as React.RefObject<HTMLParagraphElement>}
              className="text-sm"
              style={{ color: labelColor }}
            >
              Publicado em
            </p>
            <time
              ref={valueRef as React.RefObject<HTMLTimeElement>}
              className="font-medium"
              dateTime={publishedAt}
              style={{ color: valueColor }}
            >
              {formatDateTime(publishedAt)}
            </time>
          </div>
        )}
      </div>
    </div>
  )
}
