'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface StepWelcomeProps {
  defaultName: string
  onNext: (name: string) => void
  onSkip: () => void
}

export function StepWelcome({ defaultName, onNext, onSkip }: StepWelcomeProps) {
  const t = useTranslations('onboarding')
  const [name, setName] = useState(defaultName)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length > 0 && trimmed.length <= 30) {
      onNext(trimmed)
    }
  }

  const isValid = name.trim().length > 0 && name.trim().length <= 30

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          {t('step1.title', { name: defaultName || 'visitante' })}
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="name" style={{ fontSize: '14px', fontWeight: 500 }}>
            {t('step1.label')}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('step1.placeholder')}
            autoFocus
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #d1d5db)',
              fontSize: '16px',
              backgroundColor: 'var(--color-bg-input, #ffffff)',
              color: 'var(--color-text, #111827)',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          <button
            type="submit"
            disabled={!isValid}
            style={{
              padding: '14px 24px',
              borderRadius: '8px',
              backgroundColor: isValid ? 'var(--color-primary, #3b82f6)' : 'var(--color-disabled, #9ca3af)',
              color: '#ffffff',
              fontWeight: 'bold',
              border: 'none',
              cursor: isValid ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
          >
            {t('continue')}
          </button>
          
          <button
            type="button"
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
      </form>
    </div>
  )
}
