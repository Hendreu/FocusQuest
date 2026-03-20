'use client'

import React from 'react'
import { useRouter } from '@/i18n/navigation'
import { motion } from 'framer-motion'
import { usePreferences } from '@/hooks/usePreferences'
import { useAuthStore } from '@/lib/auth/auth-store'

interface MyPositionCardProps {
  myRank: number | null
  loading: boolean
}

export function MyPositionCard({ myRank, loading }: MyPositionCardProps) {
  const router = useRouter()
  const { preferences } = usePreferences()
  const { user } = useAuthStore()
  const animationsEnabled = preferences?.animationsEnabled ?? true

  if (!user || loading) return null

  const content = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        background: 'var(--color-surface)',
        borderRadius: '16px',
        border: '1px solid var(--color-border)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        marginTop: 'auto',
        position: 'sticky',
        bottom: '16px',
        zIndex: 10,
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--color-background)',
            border: '2px solid var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              {user.name?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>Sua Posição</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
            {myRank ? `#${myRank} no Ranking` : 'Não rankeado'}
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push('/profile')}
        style={{
          padding: '8px 16px',
          background: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'opacity 0.2s ease',
        }}
      >
        Ver perfil
      </button>
    </div>
  )

  if (animationsEnabled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.2 }}
      >
        {content}
      </motion.div>
    )
  }

  return <div>{content}</div>
}
