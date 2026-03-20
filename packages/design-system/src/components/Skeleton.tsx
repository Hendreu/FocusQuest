import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'

const skeleton = cva(
  [
    'rounded',
    'bg-[var(--color-bg-emphasis)]',
    // Shimmer (disabled when --anim-duration-normal is 0ms)
    'relative overflow-hidden',
    'before:absolute before:inset-0',
    'before:bg-gradient-to-r before:from-transparent before:via-[var(--color-bg-muted)] before:to-transparent',
    'before:translate-x-[-100%]',
    'before:[animation:shimmer_1.5s_infinite]',
    '[--shimmer-duration:var(--anim-duration-normal,250ms)]',
  ],
  {
    variants: {
      shape: {
        line: 'w-full',
        block: 'w-full',
        circle: 'rounded-full',
      },
    },
    defaultVariants: {
      shape: 'line',
    },
  },
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeleton> {
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className,
  shape,
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const defaultHeight = shape === 'line' ? '1rem' : shape === 'circle' ? width : '1rem'

  return (
    <div
      aria-busy="true"
      aria-label="Loading…"
      className={clsx(skeleton({ shape }), className)}
      style={{
        width: width,
        height: height ?? defaultHeight,
        ...style,
      }}
      {...props}
    />
  )
}
