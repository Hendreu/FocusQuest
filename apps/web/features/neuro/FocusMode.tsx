'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

interface FocusModeContextValue {
  active: boolean
  toggle: () => void
}

const FocusModeContext = createContext<FocusModeContextValue>({
  active: false,
  toggle: () => {},
})

export function useFocusMode() {
  return useContext(FocusModeContext)
}

interface FocusModeProps {
  children: ReactNode
  onToggle?: (active: boolean) => void
}

export function FocusMode({ children, onToggle }: FocusModeProps) {
  const [active, setActive] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('focus-mode') === 'true'
    }
    return false
  })

  const toggle = useCallback(() => {
    setActive((v) => {
      const next = !v
      sessionStorage.setItem('focus-mode', String(next))
      onToggle?.(next)
      return next
    })
  }, [onToggle])

  // Apply/remove CSS class on body
  useEffect(() => {
    if (active) {
      document.body.classList.add('focus-mode-active')
    } else {
      document.body.classList.remove('focus-mode-active')
    }
    return () => {
      document.body.classList.remove('focus-mode-active')
    }
  }, [active])

  // Keyboard shortcut: 'F' key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'f' || e.key === 'F') {
        const target = e.target as HTMLElement
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return
        }
        toggle()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggle])

  return (
    <FocusModeContext.Provider value={{ active, toggle }}>
      {children}
      {active && (
        <div
          aria-live="polite"
          style={{
            position: 'fixed',
            top: '0.75rem',
            right: '0.75rem',
            background: 'var(--color-primary)',
            color: '#fff',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          🎯 Foco ativo
        </div>
      )}
    </FocusModeContext.Provider>
  )
}
