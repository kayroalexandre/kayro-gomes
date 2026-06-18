'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React from 'react'

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
        'group overflow-hidden hover:cursor-pointer flex flex-col h-full border border-border bg-card rounded-card transition-colors hover:border-border/80',
        className,
      )}
      ref={card.ref as React.Ref<HTMLDivElement>}
    >
      <div className="relative w-full aspect-video bg-muted/5 overflow-hidden border-b border-border/10">
        {metaImage && typeof metaImage !== 'string' && (
          <div className="transition-transform duration-500 group-hover:scale-105 h-full w-full">
            <Media resource={metaImage} size="33vw" />
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        {showCategories && hasCategories && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {categories?.map((category, index) => {
              if (typeof category === 'object') {
                const { title: titleFromCategory } = category

                const categoryTitle = titleFromCategory || 'Sem categoria'

                return (
                  <span
                    key={index}
                    className="text-xs font-semibold text-primary bg-primary/10 dark:bg-primary/20 px-2.5 py-1 rounded-full"
                  >
                    {categoryTitle}
                  </span>
                )
              }

              return null
            })}
          </div>
        )}
        {titleToUse && (
          <h3 className="text-lg md:text-xl font-bold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors">
            <Link className="hover:no-underline" href={href} ref={link.ref}>
              {titleToUse}
            </Link>
          </h3>
        )}
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mt-1">
            {sanitizedDescription}
          </p>
        )}
      </div>
    </ShadcnCard>
  )
}
