'use client'

import React from 'react'

interface MicrolearningBannerProps {
  durationMinutes: number
}

export function MicrolearningBanner({ durationMinutes }: MicrolearningBannerProps) {
  if (durationMinutes < 5) return null

  return (
    <div
      role="alert"
      aria-label="Aviso de lição longa"
      style={{
        padding: '0.75rem 1rem',
        background: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '0.375rem',
        marginBottom: '1rem',
        fontSize: '0.875rem',
        color: '#92400e',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
      }}
    >
      <span aria-hidden="true" style={{ flexShrink: 0 }}>⚠️</span>
      <span>
        Esta lição tem <strong>{durationMinutes} min</strong>. Para melhor absorção,
        considere pausas entre seções.
      </span>
    </div>
  )
}
