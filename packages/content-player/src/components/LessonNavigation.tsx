import React from 'react'

interface LessonNavigationProps {
  hasNext?: boolean
  hasPrev?: boolean
  onNext?: () => void
  onPrev?: () => void
  isCompleted: boolean
}

export function LessonNavigation({ hasNext, hasPrev, onNext, onPrev, isCompleted }: LessonNavigationProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--color-border)',
        marginTop: '1.5rem',
      }}
    >
      <button
        onClick={onPrev}
        disabled={!hasPrev}
        aria-label="Lição anterior"
        style={{
          padding: '0.6rem 1.25rem',
          border: '1px solid var(--color-border)',
          borderRadius: '0.375rem',
          background: 'transparent',
          cursor: hasPrev ? 'pointer' : 'not-allowed',
          opacity: hasPrev ? 1 : 0.4,
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}
      >
        ← Anterior
      </button>

      <button
        onClick={onNext}
        disabled={!hasNext}
        aria-label="Próxima lição"
        style={{
          padding: '0.6rem 1.25rem',
          background: isCompleted ? 'var(--color-primary)' : 'var(--color-border)',
          color: isCompleted ? '#fff' : 'var(--color-muted)',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: hasNext ? 'pointer' : 'not-allowed',
          opacity: hasNext ? 1 : 0.4,
          fontWeight: isCompleted ? 600 : 400,
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}
      >
        Próxima →
      </button>
    </div>
  )
}
