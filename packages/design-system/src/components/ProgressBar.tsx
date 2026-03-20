'use client'

import React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { clsx } from 'clsx'

// ---------------------------------------------------------------------------
// Linear ProgressBar
// ---------------------------------------------------------------------------

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100 */
  value?: number
  /** Accessible label */
  label?: string
  showLabel?: boolean
  /** Track colour variant */
  variant?: 'primary' | 'xp' | 'streak' | 'success'
  size?: 'sm' | 'md' | 'lg'
}

const trackHeight = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }

const fillColor = {
  primary: 'bg-[var(--color-primary-default)]',
  xp: 'bg-[var(--color-xp)]',
  streak: 'bg-[var(--color-streak)]',
  success: 'bg-[var(--color-success-default)]',
}

export function ProgressBar({
  className,
  value = 0,
  label,
  showLabel = false,
  variant = 'primary',
  size = 'md',
  ...props
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={clsx('flex items-center gap-3', className)} {...props}>
      <ProgressPrimitive.Root
        value={clamped}
        max={100}
        aria-label={label ?? 'Progress'}
        className={clsx(
          'flex-1 overflow-hidden rounded-full',
          'bg-[var(--color-bg-emphasis)]',
          trackHeight[size],
        )}
      >
        <ProgressPrimitive.Indicator
          className={clsx(
            'h-full rounded-full',
            fillColor[variant],
            'transition-[width] duration-[var(--anim-duration-slow)] ease-[var(--anim-easing)]',
          )}
          style={{ width: `${clamped}%` }}
        />
      </ProgressPrimitive.Root>

      {showLabel && (
        <span
          className="text-sm font-medium text-[var(--color-fg-muted)] tabular-nums w-9 text-right"
          aria-hidden="true"
        >
          {clamped}%
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Circular ProgressBar
// ---------------------------------------------------------------------------

export interface CircularProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  size?: number
  strokeWidth?: number
  variant?: 'primary' | 'xp' | 'streak' | 'success'
  label?: string
  showLabel?: boolean
}

const circularFillVar = {
  primary: 'var(--color-primary-default)',
  xp: 'var(--color-xp)',
  streak: 'var(--color-streak)',
  success: 'var(--color-success-default)',
}

export function CircularProgress({
  className,
  value = 0,
  size = 48,
  strokeWidth = 4,
  variant = 'primary',
  label,
  showLabel = false,
  ...props
}: CircularProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'Progress'}
      className={clsx('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-bg-emphasis)"
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={circularFillVar[variant]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: `stroke-dashoffset var(--anim-duration-slow) var(--anim-easing)`,
          }}
        />
      </svg>

      {showLabel && (
        <span
          className="absolute text-xs font-semibold text-[var(--color-fg-default)] tabular-nums"
          aria-hidden="true"
        >
          {clamped}%
        </span>
      )}
    </div>
  )
}
