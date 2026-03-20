'use client'

import React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { clsx } from 'clsx'

export const Modal = DialogPrimitive.Root
export const ModalTrigger = DialogPrimitive.Trigger
export const ModalClose = DialogPrimitive.Close

export interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  title: string
  description?: string
  /** Show the default close (×) button. Defaults to true */
  showCloseButton?: boolean
}

export function ModalContent({
  className,
  title,
  description,
  showCloseButton = true,
  children,
  ...props
}: ModalContentProps) {
  return (
    <DialogPrimitive.Portal>
      {/* Backdrop */}
      <DialogPrimitive.Overlay
        className={clsx(
          'fixed inset-0 z-50',
          'bg-[var(--color-overlay-backdrop)] backdrop-blur-sm',
          'data-[state=open]:animate-[fadeIn_var(--anim-duration-normal)_var(--anim-easing)]',
          'data-[state=closed]:animate-[fadeOut_var(--anim-duration-fast)_var(--anim-easing)]',
        )}
      />

      {/* Panel */}
      <DialogPrimitive.Content
        className={clsx(
          'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-lg max-h-[90vh] overflow-y-auto',
          'rounded-2xl bg-[var(--color-surface-overlay)] shadow-[var(--shadow-xl)]',
          'p-6',
          'focus:outline-none',
          'data-[state=open]:animate-[dialogSlideIn_var(--anim-duration-normal)_var(--anim-easing-spring)]',
          'data-[state=closed]:animate-[dialogSlideOut_var(--anim-duration-fast)_var(--anim-easing)]',
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <DialogPrimitive.Title className="text-lg font-semibold text-[var(--color-fg-default)]">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="mt-1 text-sm text-[var(--color-fg-muted)]">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>

          {showCloseButton && (
            <DialogPrimitive.Close
              className={clsx(
                'rounded-lg p-1 text-[var(--color-fg-subtle)]',
                'hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg-default)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]',
                'transition-colors duration-[var(--anim-duration-fast)]',
                'shrink-0',
              )}
              aria-label="Close"
            >
              <CloseIcon />
            </DialogPrimitive.Close>
          )}
        </div>

        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
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
  )
}
