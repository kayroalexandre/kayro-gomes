'use client'
import { cn } from '@/utilities/ui'
import React from 'react'
import { motion } from 'framer-motion'

import { Card, CardPostData } from '@/components/Card'
import { easing } from '@/design-system/tokens/motion'

export type Props = {
  posts: CardPostData[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts } = props

  return (
    <div className={cn('container')}>
      <motion.div 
        className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-6 gap-x-6 lg:gap-y-10 lg:gap-x-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {posts?.map((result, index) => {
          if (typeof result === 'object' && result !== null) {
            return (
              <motion.div 
                className="col-span-4" 
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing.smooth } }
                }}
              >
                <Card className="h-full" doc={result} relationTo="posts" showCategories />
              </motion.div>
            )
          }

          return null
        })}
      </motion.div>
    </div>
  )
}
