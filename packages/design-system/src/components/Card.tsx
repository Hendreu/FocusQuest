import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'

const card = cva(
  ['rounded-xl overflow-hidden'],
  {
    variants: {
      variant: {
        flat: 'bg-[var(--color-surface-default)]',
        elevated: [
          'bg-[var(--color-surface-raised)]',
          'shadow-[var(--shadow-md)]',
        ],
        bordered: [
          'bg-[var(--color-surface-default)]',
          'border border-[var(--color-border-default)]',
        ],
      },
    },
    defaultVariants: {
      variant: 'elevated',
    },
  },
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof card> {}

export function Card({ className, variant, children, ...props }: CardProps) {
  return (
    <div className={clsx(card({ variant }), className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'px-6 py-4 border-b border-[var(--color-border-muted)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('px-6 py-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'px-6 py-4 border-t border-[var(--color-border-muted)] bg-[var(--color-bg-subtle)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
