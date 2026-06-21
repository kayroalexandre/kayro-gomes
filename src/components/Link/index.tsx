import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import type { Page, Post, Project } from '@/payload-types'

type CMSLinkType = {
  appearance?: 'inline' | ButtonProps['variant']
  'aria-current'?: React.AriaAttributes['aria-current']
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  reference?: {
    relationTo: 'pages' | 'posts' | 'projects'
    value: Page | Post | Project | string | number
  } | null
  size?: ButtonProps['size'] | null
  type?: 'custom' | 'reference' | null
  url?: string | null
}

export const CMSLink: React.FC<CMSLinkType & { style?: React.CSSProperties }> = (props) => {
  const {
    type,
    appearance = 'inline',
    'aria-current': ariaCurrent,
    children,
    className,
    label,
    newTab,
    reference,
    size: sizeFromProps,
    url,
    style,
  } = props

  const href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${
          reference.value.slug
        }`
      : url

  if (!href) return null

  const size = appearance === 'link' ? 'clear' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'inline') {
    return (
      <Link
        aria-current={ariaCurrent}
        className={cn(className)}
        href={href || url || ''}
        style={style}
        {...newTabProps}
      >
        {label && label}
        {children && children}
      </Link>
    )
  }

  return (
    <Button asChild className={className} size={size} variant={appearance} style={style}>
      <Link
        aria-current={ariaCurrent}
        className={cn(className)}
        href={href || url || ''}
        style={style}
        {...newTabProps}
      >
        {label && label}
        {children && children}
      </Link>
    </Button>
  )
}
