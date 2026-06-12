'use client'

import { motion, Variants } from 'framer-motion'
import React from 'react'
import { motion as motionTokens } from '../tokens/motion'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  variant?: 'fadeUp' | 'fadeDown' | 'fade' | 'scale'
  delay?: number
  staggerChildren?: boolean
}

/**
 * Componente de seção animada reutilizável
 * Implementa scroll reveals equivalentes à referência visual
 */
export function AnimatedSection({
  children,
  className,
  variant = 'fadeUp',
  delay = 0,
  staggerChildren = false,
}: AnimatedSectionProps) {
  const variants: Variants = {
    hidden: motionTokens.variants[variant].hidden,
    visible: {
      ...motionTokens.variants[variant].visible,
      transition: {
        duration: motionTokens.duration.normal,
        ease: motionTokens.easing.smooth,
        delay,
        ...(staggerChildren && {
          staggerChildren: 0.1,
        }),
      },
    },
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}

/**
 * Item de animação para uso com stagger
 */
export function AnimatedItem({
  children,
  className,
  variant = 'fadeUp',
}: {
  children: React.ReactNode
  className?: string
  variant?: 'fadeUp' | 'fadeDown' | 'fade' | 'scale'
}) {
  return (
    <motion.div className={className} variants={motionTokens.variants[variant] as Variants}>
      {children}
    </motion.div>
  )
}
