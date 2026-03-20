'use client'

import React, { createContext, useCallback, useContext, useId, useState } from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { clsx } from 'clsx'
import { cva } from 'class-variance-authority'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ToastVariant = 'success' | 'error' | 'info' | 'xp-gain'

export interface ToastItem {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  duration?: number
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface ToastContextValue {
  toast: (item: Omit<ToastItem, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...item, id }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}

        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}

        <ToastPrimitive.Viewport
          className={clsx(
            'fixed top-4 right-4 z-[9999]',
            'flex flex-col gap-2',
            'w-[360px] max-w-[calc(100vw-2rem)]',
            'outline-none',
          )}
        />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Single Toast
// ---------------------------------------------------------------------------

const toastStyle = cva(
  [
    'flex items-start gap-3 rounded-xl p-4',
    'shadow-[var(--shadow-lg)] border border-[var(--color-border-default)]',
    'data-[state=open]:animate-[toastSlideIn_var(--anim-duration-normal)_var(--anim-easing-spring)]',
    'data-[state=closed]:animate-[toastSlideOut_var(--anim-duration-fast)_var(--anim-easing)]',
    'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
    'data-[swipe=end]:animate-[toastSwipeOut_var(--anim-duration-fast)_ease-out]',
  ],
  {
    variants: {
      variant: {
        success: 'bg-[var(--color-success-subtle)] text-[var(--color-success-fg)]',
        error: 'bg-[var(--color-error-subtle)] text-[var(--color-error-fg)]',
        info: 'bg-[var(--color-surface-raised)] text-[var(--color-fg-default)]',
        'xp-gain': 'bg-[var(--color-xp-subtle)] text-[var(--color-xp)]',
      },
    },
    defaultVariants: { variant: 'info' },
  },
)

const variantIcons: Record<ToastVariant, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  'xp-gain': '⚡',
}

interface ToastItemProps {
  item: ToastItem
  onDismiss: () => void
}

function ToastItem({ item, onDismiss }: ToastItemProps) {
  return (
    <ToastPrimitive.Root
      duration={item.duration ?? 4000}
      className={toastStyle({ variant: item.variant })}
      onOpenChange={(open) => { if (!open) onDismiss() }}
    >
      <span className="text-lg leading-none mt-0.5" aria-hidden="true">
        {variantIcons[item.variant]}
      </span>

      <div className="flex-1 min-w-0">
        <ToastPrimitive.Title className="font-semibold text-sm">
          {item.title}
        </ToastPrimitive.Title>
        {item.description && (
          <ToastPrimitive.Description className="mt-0.5 text-sm opacity-80">
            {item.description}
          </ToastPrimitive.Description>
        )}
      </div>

      <ToastPrimitive.Close
        className={clsx(
          'shrink-0 rounded p-0.5 opacity-60 hover:opacity-100',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]',
          'transition-opacity duration-[var(--anim-duration-fast)]',
        )}
        aria-label="Dismiss"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  )
}
