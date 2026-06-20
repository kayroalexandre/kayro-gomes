import { cn } from '@/utilities/ui'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-[var(--control-gap)] whitespace-nowrap rounded-full text-body-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 focus-visible:ring-4 focus-visible:outline-1 aria-invalid:focus-visible:ring-0 active:scale-[0.985]",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]',
        destructive: 'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90',
        outline:
          'border border-border/40 bg-transparent text-foreground hover:bg-foreground/5 hover:border-border transition-all duration-200',
        secondary: 'bg-secondary text-secondary-foreground border border-border/5 hover:bg-secondary/80 hover:border-border/20 transition-all duration-200',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-muted-foreground hover:text-foreground transition-colors duration-200',
      },
      size: {
        clear: '',
        default:
          'h-[var(--control-height-md)] px-[var(--control-padding-x-md)] py-[var(--control-padding-y)] has-[>svg]:px-[var(--control-padding-x-sm)]',
        sm: 'h-[var(--control-height-sm)] rounded-full px-[var(--control-padding-x-sm)] has-[>svg]:px-[var(--control-padding-x-compact)]',
        lg: 'h-[var(--control-height-lg)] rounded-full px-[var(--control-padding-x-lg)] has-[>svg]:px-[var(--control-padding-x-md)] text-body',
        icon: 'size-[var(--control-height-md)]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button: React.FC<ButtonProps> = ({ asChild = false, className, size, variant, ...props }) => {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
