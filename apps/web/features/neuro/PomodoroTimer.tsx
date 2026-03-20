'use client'

import React from 'react'
import type { PomodoroPhase } from './usePomodoroState'

interface PomodoroTimerProps {
  phase: PomodoroPhase
  secondsRemaining: number
  sessionCount: number
  focusDurationMinutes: number
  onStart: () => void
  onSkipBreak: () => void
  onPause: () => void
  soundsEnabled?: boolean
}

export function PomodoroTimer({
  phase,
  secondsRemaining,
  sessionCount,
  focusDurationMinutes,
  onStart,
  onSkipBreak,
  onPause,
}: PomodoroTimerProps) {
  const totalSeconds =
    phase === 'focus'
      ? focusDurationMinutes * 60
      : phase === 'long-break'
        ? 15 * 60
        : 5 * 60

  const progress =
    totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0
  const RADIUS = 40
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)

  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60

  const color = phase === 'focus' ? '#22c55e' : '#3b82f6'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '1rem',
        background: 'var(--color-surface)',
        borderRadius: '0.75rem',
        border: '1px solid var(--color-border)',
        minWidth: '120px',
      }}
    >
      <svg width="100" height="100" viewBox="0 0 100 100" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
        <text
          x="50"
          y="55"
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill="var(--color-text)"
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </text>
      </svg>

      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--color-muted)',
          textTransform: 'uppercase',
        }}
      >
        {phase === 'idle' && 'Pronto'}
        {phase === 'focus' && '🎯 Foco'}
        {phase === 'short-break' && '☕ Pausa curta'}
        {phase === 'long-break' && '🏖 Pausa longa'}
      </div>

      <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>
        Pomodoros: {sessionCount}
      </div>

      {phase === 'idle' && (
        <button
          onClick={onStart}
          style={{
            padding: '0.35rem 1rem',
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}
        >
          Iniciar
        </button>
      )}

      {(phase === 'focus') && (
        <button
          onClick={onPause}
          style={{
            padding: '0.35rem 1rem',
            background: 'transparent',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.8rem',
          }}
        >
          Pausar
        </button>
      )}

      {(phase === 'short-break' || phase === 'long-break') && (
        <button
          onClick={onSkipBreak}
          style={{
            padding: '0.35rem 1rem',
            background: 'transparent',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.8rem',
          }}
        >
          Pular pausa
        </button>
      )}
    </div>
  )
}
