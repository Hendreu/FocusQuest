import React, { useEffect, useState } from 'react'
import type { Badge, Streak } from '@repo/types'

interface LessonCompleteResult {
  lessonId: string
  xpAwarded: number
  leveledUp: boolean
  newLevel?: number
  badgesEarned: Badge[]
  streakUpdated: Streak
}

interface CompletionModalProps {
  result: LessonCompleteResult
  onNext?: () => void
  onBack?: () => void
  hasNext?: boolean
}

export function CompletionModal({ result, onNext, onBack, hasNext }: CompletionModalProps) {
  const [displayXp, setDisplayXp] = useState(0)

  // Animated XP counter
  useEffect(() => {
    let current = 0
    const target = result.xpAwarded
    const step = Math.max(1, Math.ceil(target / 40))
    const interval = setInterval(() => {
      current = Math.min(current + step, target)
      setDisplayXp(current)
      if (current >= target) clearInterval(interval)
    }, 30)
    return () => clearInterval(interval)
  }, [result.xpAwarded])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lição concluída"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'var(--color-background, #fff)',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'modalIn 0.3s ease',
        }}
      >
        {/* Stars / confetti emoji */}
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
          {result.leveledUp ? '🎊' : '⭐'}
        </div>

        {/* XP counter */}
        <div
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            color: 'var(--color-primary)',
            marginBottom: '0.25rem',
          }}
        >
          +{displayXp} XP
        </div>

        <p style={{ fontSize: '1rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
          Lição concluída!
        </p>

        {/* Level-up */}
        {result.leveledUp && result.newLevel && (
          <div
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: '#fff',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              fontWeight: 700,
              fontSize: '1.125rem',
              animation: 'pulse 0.5s ease 3',
            }}
          >
            🎉 Level {result.newLevel}!
          </div>
        )}

        {/* Streak */}
        <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
          🔥 Sequência: <strong>{result.streakUpdated.currentStreak} dias</strong>
        </p>

        {/* Badges */}
        {result.badgesEarned.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Conquistas desbloqueadas!
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {result.badgesEarned.map((badge) => (
                <div
                  key={badge.id}
                  title={badge.name}
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '0.5rem',
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                  }}
                >
                  {badge.iconUrl ? (
                    <img src={badge.iconUrl} alt={badge.name} style={{ width: '1.5rem', height: '1.5rem', verticalAlign: 'middle', marginRight: '0.25rem' }} />
                  ) : (
                    '🏅 '
                  )}
                  {badge.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={onBack}
            style={{
              padding: '0.6rem 1.25rem',
              border: '1px solid var(--color-border)',
              borderRadius: '0.375rem',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            Voltar ao curso
          </button>
          {hasNext && (
            <button
              onClick={onNext}
              style={{
                padding: '0.6rem 1.5rem',
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Próxima lição →
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}
