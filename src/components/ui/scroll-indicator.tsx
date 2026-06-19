'use client'

import * as React from 'react'
import { cn } from '@/utilities/ui'
import { type VariantProps, cva } from 'class-variance-authority'
import { Mouse } from 'lucide-react'

const scrollIndicatorVariants = cva(
  'inline-flex items-center gap-2 font-medium transition-opacity duration-300',
  {
    variants: {
      variant: {
        default: 'text-on-dark/60',
        muted: 'text-muted-foreground',
      },
      size: {
        // 12px: menor degrau da escala SDS (scale-01); sem util semântico nomeado.
        default: 'text-scale-01',
        sm: 'text-[10px]', // design-lint-disable-line micro-label decorativo abaixo da escala SDS (mín. 12px)
        lg: 'text-body-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

interface ScrollIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof scrollIndicatorVariants> {
  /** Text label shown next to the mouse icon */
  label?: string
  /** Whether to show the animated scroll dot inside the mouse icon */
  animated?: boolean
}

/**
 * ScrollIndicator — mouse icon + label, commonly used at the bottom of hero sections.
 *
 * Follows shadcn/ui component conventions:
 * - Uses `cva` for variant-based styling
 * - Accepts `className` for overrides via `cn()`
 * - Fully composable with `React.HTMLAttributes`
 *
 * @example
 * ```tsx
 * <ScrollIndicator label="Role para explorar" />
 * <ScrollIndicator label="Scroll to explore" variant="muted" size="lg" />
 * ```
 */
const ScrollIndicator = React.forwardRef<HTMLDivElement, ScrollIndicatorProps>(
  ({ className, variant, size, label = 'Role para explorar', animated = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(scrollIndicatorVariants({ variant, size }), className)}
        data-slot="scroll-indicator"
        role="presentation"
        aria-hidden="true"
        {...props}
      >
        <span className="relative inline-flex items-center justify-center">
          <Mouse className="h-5 w-5" strokeWidth={1.5} />
          {animated && (
            <span className="absolute top-[7px] left-1/2 -translate-x-1/2 h-[6px] w-[2px] rounded-full bg-current animate-scroll-dot" />
          )}
        </span>
        {label && <span>{label}</span>}
      </div>
    )
  },
)
ScrollIndicator.displayName = 'ScrollIndicator'

export { ScrollIndicator }
