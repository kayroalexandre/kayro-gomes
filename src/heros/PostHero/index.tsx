import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { HeroOverlay } from '@/components/ui/hero-overlay'

import { DynamicPostHeroContent } from './DynamicPostHeroContent'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { heroImage } = post

  return (
    <header className="relative min-h-[80vh] flex items-end">
      <div className="container z-10 relative lg:grid lg:grid-cols-[1fr_48rem_1fr] pb-8 mt-[var(--header-h)]">
        <DynamicPostHeroContent post={post} />
      </div>
      <div className="absolute inset-0 select-none z-0">
        {heroImage && typeof heroImage !== 'string' && (
          <Media fill priority imgClassName="object-cover" resource={heroImage} />
        )}
        <HeroOverlay opacity={40} bottomFade />
      </div>
    </header>
  )
}
