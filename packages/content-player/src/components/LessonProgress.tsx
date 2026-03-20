import React from 'react'

interface LessonProgressProps {
  progress: number   // 0-100
  estimatedMinutes?: number
  contentType: 'text' | 'video' | 'quiz' | 'code'
}

export function LessonProgress({ progress, estimatedMinutes, contentType }: LessonProgressProps) {
  const clampedPct = Math.min(100, Math.max(0, progress))
  const remaining = estimatedMinutes ? Math.max(0, Math.ceil(estimatedMinutes * (1 - clampedPct / 100))) : null

  const labelMap: Record<string, string> = {
    text: 'lido',
    video: 'assistido',
    quiz: 'respondido',
    code: 'concluído',
  }

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clampedPct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progresso: ${Math.round(clampedPct)}% ${labelMap[contentType] ?? ''}`}
      style={{ width: '100%' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
        <span>{Math.round(clampedPct)}% {labelMap[contentType]}</span>
        {remaining !== null && remaining > 0 && (
          <span>~{remaining} min restantes</span>
        )}
      </div>
      <div
        style={{
          height: '6px',
          background: 'var(--color-border)',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clampedPct}%`,
            background: clampedPct >= 100 ? '#22c55e' : 'var(--color-primary)',
            borderRadius: '9999px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  )
}
