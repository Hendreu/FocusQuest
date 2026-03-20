'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { SensoryAnswers } from '../_types'

interface StepSensoryProfileProps {
  onNext: (answers: SensoryAnswers) => void
  onBack: () => void
  onSkip: () => void
}

export function StepSensoryProfile({ onNext, onBack, onSkip }: StepSensoryProfileProps) {
  const t = useTranslations('onboarding')
  
  const [answers, setAnswers] = useState<SensoryAnswers>({
    prefersMovement: null,
    soundHelpsConcentration: null,
    prefersShortSessions: null,
  })

  const handleAnswer = (key: keyof SensoryAnswers, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const isComplete = 
    answers.prefersMovement !== null && 
    answers.soundHelpsConcentration !== null && 
    answers.prefersShortSessions !== null

  const questions: { key: keyof SensoryAnswers; label: string }[] = [
    { key: 'prefersMovement', label: t('step3.q1') },
    { key: 'soundHelpsConcentration', label: t('step3.q2') },
    { key: 'prefersShortSessions', label: t('step3.q3') },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          {t('step3.title')}
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {questions.map((q) => (
          <div key={q.key} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-text, #111827)' }}>
              {q.label}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleAnswer(q.key, true)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: answers[q.key] === true ? '2px solid var(--color-primary, #3b82f6)' : '1px solid var(--color-border, #d1d5db)',
                  backgroundColor: answers[q.key] === true ? 'var(--color-primary-light, #eff6ff)' : 'var(--color-bg-card, #ffffff)',
                  color: answers[q.key] === true ? 'var(--color-primary, #3b82f6)' : 'var(--color-text, #111827)',
                  fontWeight: answers[q.key] === true ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {t('step3.yes')}
              </button>
              <button
                onClick={() => handleAnswer(q.key, false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: answers[q.key] === false ? '2px solid var(--color-primary, #3b82f6)' : '1px solid var(--color-border, #d1d5db)',
                  backgroundColor: answers[q.key] === false ? 'var(--color-primary-light, #eff6ff)' : 'var(--color-bg-card, #ffffff)',
                  color: answers[q.key] === false ? 'var(--color-primary, #3b82f6)' : 'var(--color-text, #111827)',
                  fontWeight: answers[q.key] === false ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {t('step3.no')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              flex: 1,
              padding: '14px 24px',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border, #d1d5db)',
              color: 'var(--color-text, #111827)',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {t('back')}
          </button>
          <button
            onClick={() => onNext(answers)}
            disabled={!isComplete}
            style={{
              flex: 2,
              padding: '14px 24px',
              borderRadius: '8px',
              backgroundColor: isComplete ? 'var(--color-primary, #3b82f6)' : 'var(--color-disabled, #9ca3af)',
              color: '#ffffff',
              fontWeight: 'bold',
              border: 'none',
              cursor: isComplete ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
          >
            {t('continue')}
          </button>
        </div>
        
        <button
          onClick={onSkip}
          style={{
            padding: '12px',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--color-text-muted, #6b7280)',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          {t('skip')}
        </button>
      </div>
    </div>
  )
}
