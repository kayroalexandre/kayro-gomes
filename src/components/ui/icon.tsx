'use client'

import * as React from 'react'
import { type LucideProps, Sun, Moon } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utilities/ui'

/**
 * Icon sizes following the design system tokens (spacing.json → icon.*).
 * Values are in rem (from tokens) and map to Tailwind size utilities.
 * The CSS variables (--icon-*) are the single source of truth in tokens.css.
 */
export const iconSizes = {
  sm: 16, // var(--icon-sm)   = 1rem
  md: 20, // var(--icon-md)   = 1.25rem
  lg: 24, // var(--icon-lg)   = 1.5rem
  xl: 32, // var(--icon-xl)   = 2rem
  '2xl': 48, // var(--icon-2xl) = 3rem
} as const

export type IconSize = keyof typeof iconSizes

const iconVariants = cva('', {
  variants: {
    size: {
      sm: 'size-4', // 16px
      md: 'size-5', // 20px
      lg: 'size-6', // 24px
      xl: 'size-8', // 32px
      '2xl': 'size-12', // 48px
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export interface IconProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, 'size'>, VariantProps<typeof iconVariants> {
  /**
   * The icon component to render.
   * Accepts any Lucide icon or a custom SVG component.
   * @default Sun (for demo purposes)
   */
  icon?: React.ComponentType<LucideProps>

  /**
   * Semantic size token.
   * @default 'md'
   */
  size?: IconSize

  /**
   * Optional label for accessibility.
   * When provided, the icon becomes an inline element with proper ARIA attributes.
   */
  label?: string
}

/**
 * Icon component — a library-agnostic wrapper for SVG icons.
 *
 * Initially powered by lucide-react, but designed to be swapped
 * without changing consuming components.
 *
 * @example
 * ```tsx
 * <Icon icon={Sun} size="lg" />
 * <Icon icon={Moon} size="sm" className="text-muted-foreground" />
 * ```
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ icon: IconComponent = Sun, size = 'md', className, label, ...props }, ref) => {
    // Use CSS variable for the actual size (rem-based, from design tokens)
    const iconSizeVar = `var(--icon-${size})`

    // If a label is provided, we treat the icon as decorative but labeled
    const ariaProps = label
      ? { 'aria-label': label, role: 'img' as const }
      : { 'aria-hidden': true as const }

    return (
      <IconComponent
        ref={ref}
        width={iconSizeVar}
        height={iconSizeVar}
        className={cn(iconVariants({ size }), className)}
        style={{ width: iconSizeVar, height: iconSizeVar }}
        {...ariaProps}
        {...props}
      />
    )
  },
)

Icon.displayName = 'Icon'

/**
 * Pre-configured icon components for common use cases.
 * These are convenience exports — you can still use <Icon icon={X} /> directly.
 */
export const SunIcon: React.FC<Omit<IconProps, 'icon'>> = (props) => <Icon icon={Sun} {...props} />
export const MoonIcon: React.FC<Omit<IconProps, 'icon'>> = (props) => (
  <Icon icon={Moon} {...props} />
)

export default Icon
