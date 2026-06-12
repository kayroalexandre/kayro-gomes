'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { Card as ShadcnCard } from '@/components/ui/card'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  return (
    <ShadcnCard
      className={cn(
        'overflow-hidden hover:cursor-pointer flex flex-col h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg',
        className,
      )}
      ref={card.ref as React.Ref<HTMLDivElement>}
    >
      <div className="relative w-full aspect-video bg-muted/10">
        {metaImage && typeof metaImage !== 'string' && <Media resource={metaImage} size="33vw" />}
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        {showCategories && hasCategories && (
          <div className="uppercase text-sm text-muted-foreground">
            {categories?.map((category, index) => {
              if (typeof category === 'object') {
                const { title: titleFromCategory } = category

                const categoryTitle = titleFromCategory || 'Untitled category'

                const isLast = index === categories.length - 1

                return (
                  <Fragment key={index}>
                    {categoryTitle}
                    {!isLast && <Fragment>, &nbsp;</Fragment>}
                  </Fragment>
                )
              }

              return null
            })}
          </div>
        )}
        {titleToUse && (
          <div className="prose">
            <h3 className="text-xl font-bold leading-snug">
              <Link className="not-prose hover:underline" href={href} ref={link.ref}>
                {titleToUse}
              </Link>
            </h3>
          </div>
        )}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mt-auto">
            {sanitizedDescription}
          </p>
        )}
      </div>
    </ShadcnCard>
  )
}
