import React, { useId } from 'react'
import { clsx } from 'clsx'

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  hint?: string
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leadingIcon,
      trailingIcon,
      id: idProp,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const id = idProp ?? generatedId
    const errorId = `${id}-error`
    const hintId = `${id}-hint`

    const describedBy = [
      error ? errorId : null,
      hint && !error ? hintId : null,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={clsx('flex flex-col gap-1.5', className)}>
        {label && (
          <label
            htmlFor={id}
            className={clsx(
              'text-sm font-medium',
              disabled
                ? 'text-[var(--color-fg-subtle)]'
                : 'text-[var(--color-fg-default)]',
            )}
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leadingIcon && (
            <span
              aria-hidden="true"
              className="absolute left-3 text-[var(--color-fg-subtle)] pointer-events-none"
            >
              {leadingIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy || undefined}
            className={clsx(
              'w-full rounded-lg border bg-[var(--color-bg-base)] text-[var(--color-fg-default)]',
              'px-3 py-2 text-base',
              'placeholder:text-[var(--color-fg-subtle)]',
              'transition-colors duration-[var(--anim-duration-fast)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-[var(--focus-ring-offset)]',
              'disabled:cursor-not-allowed disabled:opacity-40',
              error
                ? 'border-[var(--color-error-default)]'
                : 'border-[var(--color-border-default)] hover:border-[var(--color-border-emphasis)]',
              leadingIcon && 'pl-9',
              trailingIcon && 'pr-9',
            )}
            {...props}
          />

          {trailingIcon && (
            <span
              aria-hidden="true"
              className="absolute right-3 text-[var(--color-fg-subtle)] pointer-events-none"
            >
              {trailingIcon}
            </span>
          )}
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-sm text-[var(--color-error-fg)]">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={hintId} className="text-sm text-[var(--color-fg-subtle)]">
            {hint}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
