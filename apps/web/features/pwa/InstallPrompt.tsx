'use client'

import { useEffect, useState } from 'react'

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if running as standalone PWA
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(isStandaloneMode)

    if (isStandaloneMode) return

    // iOS Safari detection
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIosDevice)

    // Check dismissed and visit count
    const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0', 10) + 1
    localStorage.setItem('pwa-visit-count', visitCount.toString())

    const dismissedAt = localStorage.getItem('pwa-dismissed-at')
    const isDismissedRecently = dismissedAt && (Date.now() - parseInt(dismissedAt, 10)) < 7 * 24 * 60 * 60 * 1000

    if (visitCount >= 2 && !isDismissedRecently) {
      if (isIosDevice) {
        setShowPrompt(true)
      } else {
        const handleBeforeInstallPrompt = (e: Event) => {
          e.preventDefault()
          setDeferredPrompt(e)
          setShowPrompt(true)
        }
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }
    }
  }, [])

  if (!showPrompt || isStandalone) return null

  const handleDismiss = () => {
    localStorage.setItem('pwa-dismissed-at', Date.now().toString())
    setShowPrompt(false)
  }

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 2rem)',
        maxWidth: '400px',
        backgroundColor: '#0F0F1A',
        color: 'white',
        padding: '1rem',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        zIndex: 50,
        border: '1px solid #1f2937'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.25rem' }}>📲</span>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Instale o FocusQuest</h3>
          {isIOS ? (
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#9ca3af' }}>
              Toque em Compartilhar e depois "Adicionar à Tela de Início"
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#9ca3af' }}>
              Acesso mais rápido e offline
            </p>
          )}
        </div>
      </div>
      
      {!isIOS && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button
            onClick={handleDismiss}
            style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: 'transparent',
              color: '#d1d5db',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Não agora
          </button>
          <button
            onClick={handleInstall}
            style={{
              flex: 1,
              padding: '0.5rem',
              backgroundColor: '#6C63FF',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Instalar
          </button>
        </div>
      )}
      {isIOS && (
        <button
          onClick={handleDismiss}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            backgroundColor: 'transparent',
            color: '#d1d5db',
            border: '1px solid #374151',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          Dispensar
        </button>
      )}
    </div>
  )
}