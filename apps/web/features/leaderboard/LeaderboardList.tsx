'use client'

import React, { useRef, useState, useEffect } from 'react'
import { List } from 'react-window'
import { LeaderboardEntry } from './LeaderboardEntry'
import { useAuthStore } from '@/lib/auth/auth-store'
import type { LeaderboardEntry as LeaderboardEntryType } from '@repo/types'

interface LeaderboardListProps {
  entries: LeaderboardEntryType[]
  loading: boolean
}

export function LeaderboardList({ entries, loading }: LeaderboardListProps) {
  const { user } = useAuthStore()
  const listRef = useRef<HTMLDivElement>(null)
  const [listHeight, setListHeight] = useState(600)

  useEffect(() => {
    if (listRef.current) {
      setListHeight(listRef.current.clientHeight || 600)
    }

    const handleResize = () => {
      if (listRef.current) {
        setListHeight(listRef.current.clientHeight)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--color-muted)' }}>Carregando leaderboard...</div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--color-muted)' }}>Nenhum jogador encontrado.</div>
      </div>
    )
  }

  return (
    <div ref={listRef} style={{ flex: 1, height: '100%', minHeight: 0, width: '100%' }}>
      <List
        style={{ height: listHeight, width: '100%', overflowX: 'hidden' }}
        rowCount={entries.length}
        rowHeight={88} // 80px + 8px margin
        rowProps={{ entries, userId: user?.id }}
        rowComponent={({ index, style, entries, userId }) => {
          const entry = (entries as LeaderboardEntryType[])[index]
          if (!entry) return null
          return (
            <LeaderboardEntry
              key={entry.userId}
              entry={entry}
              index={index}
              style={style}
              isMe={userId === entry.userId}
            />
          )
        }}
      />
    </div>
  )
}
