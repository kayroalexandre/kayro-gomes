import type { Post, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'
import { ProjectGrid } from '@/components/ProjectGrid'
import type { ProjectCardData } from '@/components/ProjectCard'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const {
    id,
    categories,
    introContent,
    limit: limitFromProps,
    populateBy,
    relationTo = 'posts',
    selectedDocs,
  } = props

  const limit = limitFromProps || 3

  if (populateBy === 'collection' && relationTo === 'projects') {
    const payload = await getPayload({ config: configPromise })

    const fetchedProjects = await payload.find({
      collection: 'projects',
      depth: 1,
      limit,
      overrideAccess: false,
      sort: '-publishedAt',
      select: {
        title: true,
        slug: true,
        summary: true,
        tech: true,
        coverImage: true,
        categories: true,
        meta: true,
      },
    })

    return (
      <div className="py-[var(--space-section-y)] md:py-[var(--space-section-y-lg)]" id={`block-${id}`}>
        {introContent && (
          <div className="container mb-16">
            <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
          </div>
        )}
        <ProjectGrid projects={fetchedProjects.docs as ProjectCardData[]} />
      </div>
    )
  }

  let posts: Post[] = []

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedPosts = await payload.find({
      collection: 'posts',
      depth: 1,
      limit,
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              categories: {
                in: flattenedCategories,
              },
            },
          }
        : {}),
    })

    posts = fetchedPosts.docs
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post) => {
        if (typeof post.value === 'object' && post.relationTo === 'posts') return post.value
      }) as Post[]

      posts = filteredSelectedPosts.filter(Boolean)
    }
  }

  return (
    <div className="py-[var(--space-section-y)] md:py-[var(--space-section-y-lg)]" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive posts={posts} />
    </div>
  )
}
