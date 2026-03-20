import React, { useState, useCallback } from 'react'
import type { Badge, Streak } from '@repo/types'
import { useLessonContent } from './hooks/useLessonContent'
import { TextLesson } from './components/TextLesson'
import { VideoLesson } from './components/VideoLesson'
import { QuizLesson } from './components/QuizLesson'
import { CodeLesson } from './components/CodeLesson'
import { LessonProgress } from './components/LessonProgress'
import { LessonNavigation } from './components/LessonNavigation'
import { CompletionModal } from './components/CompletionModal'

export interface LessonCompleteResult {
  lessonId: string
  xpAwarded: number
  leveledUp: boolean
  newLevel?: number
  badgesEarned: Badge[]
  streakUpdated: Streak
}

export interface ContentPlayerProps {
  lessonId: string
  courseId: string
  apiBaseUrl: string
  accessToken: string | null
  onComplete?: (result: LessonCompleteResult) => void
  onNext?: () => void
  onPrev?: () => void
  hasNext?: boolean
  hasPrev?: boolean
  animationsEnabled?: boolean
  focusMode?: boolean
}

export function ContentPlayer({
  lessonId,
  courseId: _courseId,
  apiBaseUrl,
  accessToken,
  onComplete,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: ContentPlayerProps) {
  const { lesson, content, isLoading, error } = useLessonContent(lessonId, apiBaseUrl, accessToken)
  const [progress, setProgress] = useState(0)
  const [isLessonCompleted, setIsLessonCompleted] = useState(false)
  const [completionResult, setCompletionResult] = useState<LessonCompleteResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleComplete = useCallback(async () => {
    if (isSubmitting || isLessonCompleted) return
    setIsSubmitting(true)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

      const res = await fetch(`${apiBaseUrl}/progress/complete`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ lessonId }),
      })

      if (!res.ok) throw new Error(`Progress submit failed: ${res.status}`)

      const json = (await res.json()) as {
        data: {
          xp: number
          leveledUp: boolean
          newLevel?: number
          badges: Badge[]
          streak: Streak
        }
      }

      const result: LessonCompleteResult = {
        lessonId,
        xpAwarded: json.data.xp,
        leveledUp: json.data.leveledUp,
        newLevel: json.data.newLevel,
        badgesEarned: json.data.badges ?? [],
        streakUpdated: json.data.streak,
      }

      setIsLessonCompleted(true)
      setCompletionResult(result)
      setProgress(100)
      onComplete?.(result)
    } catch (err) {
      console.error('Failed to mark lesson complete:', err)
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, isLessonCompleted, accessToken, apiBaseUrl, lessonId, onComplete])

  // Loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div role="status" aria-label="Carregando lição">
          Carregando...
        </div>
      </div>
    )
  }

  // Error state
  if (error || !lesson || !content) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        <p>Erro ao carregar lição: {error ?? 'Conteúdo não encontrado'}</p>
      </div>
    )
  }

  const payload = content.payload

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          {lesson.title}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
          {lesson.durationMinutes} min · {lesson.contentType}
          {lesson.xpReward > 0 && ` · +${lesson.xpReward} XP`}
        </p>
      </div>

      {/* Progress bar */}
      <LessonProgress
        progress={progress}
        estimatedMinutes={lesson.durationMinutes}
        contentType={payload.type}
      />

      {/* Content renderer */}
      {payload.type === 'text' && (
        <TextLesson
          content={payload}
          onProgressChange={(pct) => {
            setProgress(pct)
            if (pct >= 100 && !isLessonCompleted) void handleComplete()
          }}
        />
      )}

      {payload.type === 'video' && (
        <VideoLesson
          content={payload}
          lessonId={lessonId}
          onComplete={() => { if (!isLessonCompleted) void handleComplete() }}
        />
      )}

      {payload.type === 'quiz' && (
        <QuizLesson
          content={payload}
          onComplete={(_score, total) => {
            setProgress((prev) => Math.max(prev, Math.round((_score / total) * 100)))
            if (!isLessonCompleted) void handleComplete()
          }}
        />
      )}

      {payload.type === 'code' && (
        <CodeLesson
          content={payload}
          lessonId={lessonId}
          apiBaseUrl={apiBaseUrl}
          accessToken={accessToken}
          onComplete={() => { if (!isLessonCompleted) void handleComplete() }}
        />
      )}

      {/* Navigation */}
      <LessonNavigation
        hasNext={hasNext}
        hasPrev={hasPrev}
        onNext={onNext}
        onPrev={onPrev}
        isCompleted={isLessonCompleted}
      />

      {/* Completion modal */}
      {completionResult && (
        <CompletionModal
          result={completionResult}
          onNext={hasNext ? () => { setCompletionResult(null); onNext?.() } : undefined}
          onBack={() => setCompletionResult(null)}
          hasNext={hasNext}
        />
      )}
    </div>
  )
}
