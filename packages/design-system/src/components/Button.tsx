import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'

const button = cva(
  [
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg',
    'transition-colors duration-[var(--anim-duration-fast)] ease-[var(--anim-easing)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-[var(--focus-ring-offset)]',
    'disabled:pointer-events-none disabled:opacity-40',
    'select-none cursor-pointer',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--color-primary-default)] text-[var(--color-fg-on-accent)]',
          'hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)]',
        ],
        secondary: [
          'bg-[var(--color-bg-muted)] text-[var(--color-fg-default)] border border-[var(--color-border-default)]',
          'hover:bg-[var(--color-bg-emphasis)] active:bg-[var(--color-bg-emphasis)]',
        ],
        ghost: [
          'bg-transparent text-[var(--color-fg-default)]',
          'hover:bg-[var(--color-bg-muted)] active:bg-[var(--color-bg-emphasis)]',
        ],
        destructive: [
          'bg-[var(--color-error-default)] text-[var(--color-fg-on-accent)]',
          'hover:opacity-90 active:opacity-80',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  loading?: boolean
  /** Icon rendered before label */
  leadingIcon?: React.ReactNode
  /** Icon rendered after label */
  trailingIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      disabled,
      children,
      leadingIcon,
      trailingIcon,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        className={clsx(button({ variant, size }), className)}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <Spinner size={size} />
        ) : (
          leadingIcon && <span aria-hidden="true">{leadingIcon}</span>
        )}
        {children}
        {!loading && trailingIcon && (
          <span aria-hidden="true">{trailingIcon}</span>
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'

// --- Inline spinner -----------------------------------------------------------

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | null
}

function Spinner({ size }: SpinnerProps) {
  const dim = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <svg
      className={clsx(dim, 'animate-spin')}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
