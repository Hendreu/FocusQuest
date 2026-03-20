'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { usePreferences } from '@/hooks/usePreferences'

export function SensoryPanel() {
  const [open, setOpen] = useState(false)
  const { preferences, updatePreferences } = usePreferences()

  // Local (unsaved) state mirrors preferences
  const [animationsEnabled, setAnimationsEnabled] = useState(
    preferences?.animationsEnabled ?? true,
  )
  const [soundEnabled, setSoundEnabled] = useState(
    preferences?.soundEnabled ?? true,
  )
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>(
    preferences?.fontSize ?? 'normal',
  )
  const [highContrast, setHighContrast] = useState(false)

  // Sync from loaded preferences
  useEffect(() => {
    if (preferences) {
      setAnimationsEnabled(preferences.animationsEnabled)
      setSoundEnabled(preferences.soundEnabled)
      setFontSize(preferences.fontSize)
    }
  }, [preferences])

  // Apply animations immediately (without saving)
  useEffect(() => {
    if (!animationsEnabled) {
      document.body.setAttribute('data-no-animations', 'true')
    } else {
      document.body.removeAttribute('data-no-animations')
    }
  }, [animationsEnabled])

  // Apply font size immediately
  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize)
  }, [fontSize])

  // Apply high contrast immediately
  useEffect(() => {
    if (highContrast) {
      document.documentElement.setAttribute('data-theme', 'high-contrast')
    } else {
      const stored = localStorage.getItem('theme') ?? 'light'
      document.documentElement.setAttribute('data-theme', stored)
    }
  }, [highContrast])

  // Keyboard shortcut: Ctrl+Shift+A
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSave = useCallback(async () => {
    await updatePreferences({
      animations_enabled: animationsEnabled,
      sounds_enabled: soundEnabled,
      font_size: fontSize,
    })
    setOpen(false)
  }, [animationsEnabled, soundEnabled, fontSize, updatePreferences])

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Painel de ajuste sensorial (Ctrl+Shift+A)"
        aria-expanded={open}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          width: '3rem',
          height: '3rem',
          borderRadius: '50%',
          background: 'var(--color-primary)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.25rem',
          zIndex: 9998,
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ⚙
      </button>

      {/* Drawer panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Ajuste sensorial"
          style={{
            position: 'fixed',
            bottom: '5.5rem',
            right: '1.5rem',
            width: '280px',
            background: 'var(--color-background)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            zIndex: 9997,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          <h3
            style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem', marginTop: 0 }}
          >
            Ajuste Sensorial
          </h3>

          {/* Animations toggle */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <label style={{ fontSize: '0.875rem' }}>Animações</label>
            <button
              onClick={() => setAnimationsEnabled((v) => !v)}
              style={{
                padding: '0.25rem 0.75rem',
                background: animationsEnabled
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
                color: animationsEnabled ? '#fff' : 'var(--color-text)',
                border: 'none',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              {animationsEnabled ? 'On' : 'Off'}
            </button>
          </div>

          {/* Sounds toggle */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <label style={{ fontSize: '0.875rem' }}>Sons</label>
            <button
              onClick={() => setSoundEnabled((v) => !v)}
              style={{
                padding: '0.25rem 0.75rem',
                background: soundEnabled
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
                color: soundEnabled ? '#fff' : 'var(--color-text)',
                border: 'none',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              {soundEnabled ? 'On' : 'Off'}
            </button>
          </div>

          {/* High contrast toggle */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <label style={{ fontSize: '0.875rem' }}>Alto contraste</label>
            <button
              onClick={() => setHighContrast((v) => !v)}
              style={{
                padding: '0.25rem 0.75rem',
                background: highContrast
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
                color: highContrast ? '#fff' : 'var(--color-text)',
                border: 'none',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              {highContrast ? 'On' : 'Off'}
            </button>
          </div>

          {/* Font size picker */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                fontSize: '0.875rem',
                display: 'block',
                marginBottom: '0.375rem',
              }}
            >
              Tamanho da fonte
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['normal', 'large', 'xlarge'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  style={{
                    flex: 1,
                    padding: '0.25rem',
                    background:
                      fontSize === size
                        ? 'var(--color-primary)'
                        : 'var(--color-border)',
                    color: fontSize === size ? '#fff' : 'var(--color-text)',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: fontSize === size ? 600 : 400,
                  }}
                >
                  {size === 'normal' ? 'Normal' : size === 'large' ? 'Grande' : 'XL'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => void handleSave()}
            style={{
              width: '100%',
              padding: '0.6rem',
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Salvar preferências
          </button>
        </div>
      )}
    </>
  )
}
