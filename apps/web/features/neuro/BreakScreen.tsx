'use client'

import React from 'react'
import type { PomodoroPhase } from './usePomodoroState'

interface BreakScreenProps {
  phase: PomodoroPhase
  secondsRemaining: number
  onSkip: () => void
}

export function BreakScreen({ phase, secondsRemaining, onSkip }: BreakScreenProps) {
  if (phase !== 'short-break' && phase !== 'long-break') return null

  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pausa ativa — animação de respiração"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
      }}
    >
      {/* Breathing animation circle */}
      <div
        aria-hidden="true"
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.4)',
          animation: 'breathe 8s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.4); opacity: 1; }
        }
      `}</style>

      <h2
        style={{
          color: '#fff',
          fontSize: '1.5rem',
          fontWeight: 700,
          margin: 0,
          textAlign: 'center',
        }}
      >
        Respire. Você merece essa pausa.
      </h2>

      <p
        aria-live="polite"
        style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: '2rem',
          fontWeight: 700,
          margin: 0,
        }}
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </p>

      <button
        onClick={onSkip}
        style={{
          padding: '0.6rem 1.5rem',
          background: 'transparent',
          color: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontSize: '0.9rem',
        }}
      >
        Pular pausa
      </button>
    </div>
  )
}
