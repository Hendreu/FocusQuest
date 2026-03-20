'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { usePreferences } from '@/hooks/usePreferences'
import type { LeaderboardEntry as LeaderboardEntryType } from '@repo/types'

interface LeaderboardEntryProps {
  entry: LeaderboardEntryType
  index: number
  style?: React.CSSProperties
  isMe?: boolean
}

export function LeaderboardEntry({ entry, index, style, isMe }: LeaderboardEntryProps) {
  const { preferences } = usePreferences()
  const animationsEnabled = preferences?.animationsEnabled ?? true

  const isTop3 = entry.rank <= 3
  let rankIcon: React.ReactNode = entry.rank
  if (entry.rank === 1) rankIcon = '🥇'
  else if (entry.rank === 2) rankIcon = '🥈'
  else if (entry.rank === 3) rankIcon = '🥉'

  const content = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        background: isMe ? 'var(--color-surface)' : 'var(--color-background)',
        border: '1px solid',
        borderColor: isMe ? 'var(--color-primary)' : 'var(--color-border)',
        borderRadius: '12px',
        boxShadow: isTop3 ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
        height: 'calc(100% - 8px)', // room for gap in react-window
        boxSizing: 'border-box',
        gap: '16px',
        width: '100%',
      }}
    >
      <div
        style={{
          width: '32px',
          fontWeight: 700,
          color: isTop3 ? 'var(--color-primary)' : 'var(--color-muted)',
          fontSize: isTop3 ? '1.25rem' : '1rem',
          textAlign: 'center',
        }}
      >
        {rankIcon}
      </div>

      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'var(--color-background)',
          border: '2px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {entry.avatarBaseCharacter ? (
          <img
            src={`/avatars/${entry.avatarBaseCharacter}.png`}
            alt={entry.userName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <span style={{ fontSize: '1.2rem', color: 'var(--color-muted)' }}>
            {entry.userName?.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <div
          style={{
            fontWeight: 600,
            color: 'var(--color-text)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {entry.userName}
          {isMe && ' (Você)'}
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
          Nível {entry.level} • {entry.currentStreak} 🔥
        </div>
      </div>

      <div
        style={{
          fontWeight: 700,
          color: 'var(--color-primary)',
          fontSize: '1.125rem',
        }}
      >
        {entry.currentXp.toLocaleString()} XP
      </div>
    </div>
  )

  const containerStyle = { ...style, paddingBottom: '8px' }

  if (animationsEnabled) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
        style={containerStyle}
      >
        {content}
      </motion.div>
    )
  }

  return <div style={containerStyle}>{content}</div>
}
