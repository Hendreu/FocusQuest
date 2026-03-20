import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'

const avatarContainer = cva(
  [
    'relative inline-flex items-center justify-center',
    'rounded-full overflow-hidden shrink-0',
    'bg-[var(--color-primary-subtle)] text-[var(--color-primary-fg)]',
    'font-semibold select-none',
  ],
  {
    variants: {
      size: {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-14 h-14 text-lg',
        xl: 'w-20 h-20 text-2xl',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

const statusDot = cva(
  [
    'absolute bottom-0 right-0 rounded-full',
    'ring-2 ring-[var(--color-bg-base)]',
  ],
  {
    variants: {
      status: {
        online: 'bg-[var(--color-success-default)]',
        offline: 'bg-[var(--color-fg-subtle)]',
      },
      size: {
        xs: 'w-1.5 h-1.5',
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5',
        lg: 'w-3 h-3',
        xl: 'w-4 h-4',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof avatarContainer> {
  src?: string
  alt?: string
  name?: string
  status?: 'online' | 'offline'
}

export function Avatar({
  className,
  size,
  src,
  alt,
  name,
  status,
  ...props
}: AvatarProps) {
  const initials = name ? getInitials(name) : '?'
  const label = alt ?? name ?? 'Avatar'

  return (
    <div
      className={clsx(avatarContainer({ size }), className)}
      role="img"
      aria-label={label}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={label}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}

      {status && (
        <span
          className={clsx(statusDot({ status, size }))}
          aria-label={status === 'online' ? 'Online' : 'Offline'}
          role="status"
        />
      )}
    </div>
  )
}
