import React from 'react'
import type { QuizContent } from '@repo/types'
import { useQuizState } from '../hooks/useQuizState'

interface QuizLessonProps {
  content: QuizContent
  onComplete?: (score: number, total: number) => void
}

export function QuizLesson({ content, onComplete }: QuizLessonProps) {
  const {
    currentIndex,
    score,
    totalQuestions,
    isFinished,
    currentQuestion,
    currentAnswer,
    selectOption,
    submitAnswer,
    nextQuestion,
    reset,
  } = useQuizState(content)

  if (isFinished) {
    const passed = score >= Math.ceil((content.passingScore / 100) * totalQuestions)
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{passed ? '🎉' : '📚'}</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {passed ? 'Parabéns!' : 'Quase lá!'}
        </h2>
        <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>
          Você acertou <strong>{score}</strong> de <strong>{totalQuestions}</strong> questões
        </p>
        <p style={{ color: passed ? '#22c55e' : '#f59e0b', fontWeight: 600, marginBottom: '2rem' }}>
          {passed ? '✓ Lição concluída!' : `Nota mínima: ${content.passingScore}%`}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              padding: '0.6rem 1.5rem',
              border: '1px solid var(--color-border)',
              borderRadius: '0.375rem',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
          {passed && (
            <button
              onClick={() => onComplete?.(score, totalQuestions)}
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
              Concluir lição
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!currentQuestion || !currentAnswer) return null

  const feedbackOption =
    currentAnswer.submitted && currentAnswer.selectedOptionId
      ? currentQuestion.options.find((o) => o.id === currentAnswer.selectedOptionId)
      : null

  const correctOption = currentQuestion.options.find((o) => o.isCorrect)

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Progress */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {content.questions.map((q, i) => (
          <div
            key={q.id}
            style={{
              width: '2rem',
              height: '0.375rem',
              borderRadius: '9999px',
              background:
                i < currentIndex
                  ? '#22c55e'
                  : i === currentIndex
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
            }}
          />
        ))}
      </div>

      <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
        Questão {currentIndex + 1} de {totalQuestions}
      </p>

      <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', lineHeight: 1.5 }}>
        {currentQuestion.text}
      </h2>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {currentQuestion.options.map((option) => {
          let borderColor = 'var(--color-border)'
          let bgColor = 'transparent'

          if (currentAnswer.submitted) {
            if (option.isCorrect) {
              borderColor = '#22c55e'
              bgColor = 'rgba(34,197,94,0.1)'
            } else if (option.id === currentAnswer.selectedOptionId) {
              borderColor = '#ef4444'
              bgColor = 'rgba(239,68,68,0.1)'
            }
          } else if (option.id === currentAnswer.selectedOptionId) {
            borderColor = 'var(--color-primary)'
            bgColor = 'rgba(var(--color-primary-rgb,99,102,241),0.1)'
          }

          return (
            <button
              key={option.id}
              disabled={currentAnswer.submitted}
              onClick={() => selectOption(option.id)}
              style={{
                padding: '0.875rem 1rem',
                border: `2px solid ${borderColor}`,
                borderRadius: '0.5rem',
                background: bgColor,
                cursor: currentAnswer.submitted ? 'default' : 'pointer',
                textAlign: 'left',
                fontSize: '0.975rem',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              {option.text}
            </button>
          )
        })}
      </div>

      {/* Immediate feedback */}
      {currentAnswer.submitted && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '0.5rem',
            background: currentAnswer.isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${currentAnswer.isCorrect ? '#22c55e' : '#ef4444'}`,
            marginBottom: '1.25rem',
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
            {currentAnswer.isCorrect ? '✅ Correto!' : '❌ Incorreto'}
          </p>
          {feedbackOption?.feedback && (
            <p style={{ fontSize: '0.9rem' }}>{feedbackOption.feedback}</p>
          )}
          {!currentAnswer.isCorrect && correctOption && (
            <p style={{ fontSize: '0.9rem' }}>
              Resposta correta: <strong>{correctOption.text}</strong>
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        {!currentAnswer.submitted ? (
          <button
            disabled={!currentAnswer.selectedOptionId}
            onClick={submitAnswer}
            style={{
              padding: '0.6rem 1.5rem',
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: currentAnswer.selectedOptionId ? 'pointer' : 'not-allowed',
              opacity: currentAnswer.selectedOptionId ? 1 : 0.5,
              fontWeight: 600,
            }}
          >
            Confirmar
          </button>
        ) : (
          <button
            onClick={nextQuestion}
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
            {currentIndex + 1 < totalQuestions ? 'Próxima questão →' : 'Ver resultado'}
          </button>
        )}
      </div>
    </div>
  )
}
