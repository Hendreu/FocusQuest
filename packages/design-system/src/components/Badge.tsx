import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'

const badge = cva(
  [
    'inline-flex items-center gap-1 font-medium rounded-full',
    'transition-colors duration-[var(--anim-duration-fast)]',
  ],
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-bg-muted)] text-[var(--color-fg-muted)]',
        success: 'bg-[var(--color-success-subtle)] text-[var(--color-success-fg)]',
        warning: 'bg-[var(--color-warning-subtle)] text-[var(--color-warning-fg)]',
        error: 'bg-[var(--color-error-subtle)] text-[var(--color-error-fg)]',
        xp: 'bg-[var(--color-xp-subtle)] text-[var(--color-xp)]',
        streak: 'bg-[var(--color-streak-subtle)] text-[var(--color-streak)]',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badge> {
  icon?: React.ReactNode
}

export function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <span className={clsx(badge({ variant, size }), className)} {...props}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  )
}
