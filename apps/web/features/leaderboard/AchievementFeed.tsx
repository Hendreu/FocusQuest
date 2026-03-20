'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePreferences } from '@/hooks/usePreferences'
import { useAuthStore } from '@/lib/auth/auth-store'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface FeedEvent {
  id: string
  type: string
  message: string
  timestamp: string
  userId?: string
  userName?: string
  avatarBaseCharacter?: string
}

export function AchievementFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([])
  const { preferences } = usePreferences()
  const { accessToken } = useAuthStore()
  const animationsEnabled = preferences?.animationsEnabled ?? true

  useEffect(() => {
    let mounted = true
    let eventSource: EventSource | null = null
    let pollInterval: NodeJS.Timeout | null = null

    const fetchRecent = async () => {
      try {
        const res = await fetch(`${API_URL}/gamification/feed/recent`, {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        })
        if (res.ok) {
          const data = await res.json()
          if (mounted) {
            setEvents(data)
          }
        }
      } catch (err) {
        console.error('Error fetching recent feed:', err)
      }
    }

    const startSSE = () => {
      try {
        eventSource = new EventSource(`${API_URL}/gamification/feed`)
        
        eventSource.onmessage = (e) => {
          if (e.data === ':') return // Heartbeat
          try {
            const data = JSON.parse(e.data)
            if (data.type === 'connected') return
            
            if (mounted) {
              setEvents((prev) => {
                const exists = prev.some((p) => p.id === data.id)
                if (exists) return prev
                const newEvents = [data, ...prev]
                return newEvents.slice(0, 10)
              })
            }
          } catch (err) {
            console.error('Error parsing SSE event:', err)
          }
        }

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close()
            eventSource = null
          }
          startPolling()
        }
      } catch (err) {
        startPolling()
      }
    }

    const startPolling = () => {
      if (pollInterval) return
      fetchRecent()
      pollInterval = setInterval(fetchRecent, 30000)
    }

    fetchRecent().then(() => {
      if (mounted) {
        startSSE()
      }
    })

    return () => {
      mounted = false
      if (eventSource) {
        eventSource.close()
      }
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [accessToken])

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '24px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', color: 'var(--color-text)' }}>
        Atividade Recente
      </h3>
      
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
        {events.length === 0 ? (
          <div style={{ color: 'var(--color-muted)', textAlign: 'center', marginTop: '32px' }}>
            Nenhuma atividade recente.
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {events.map((event) => (
              <FeedItem key={event.id} event={event} animationsEnabled={animationsEnabled} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

function FeedItem({ event, animationsEnabled }: { event: FeedEvent; animationsEnabled: boolean }) {
  const content = (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px',
        background: 'var(--color-background)',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {event.avatarBaseCharacter ? (
          <img
            src={`/avatars/${event.avatarBaseCharacter}.png`}
            alt={event.userName || 'User'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <span style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
            {event.userName?.charAt(0).toUpperCase() || '?'}
          </span>
        )}
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.4 }}>
          <span style={{ fontWeight: 600 }}>{event.userName || 'Alguém'}</span> {event.message}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '4px' }}>
          {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )

  if (animationsEnabled) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, height: 0, scale: 0.9 }}
        animate={{ opacity: 1, height: 'auto', scale: 1 }}
        exit={{ opacity: 0, height: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    )
  }

  return <div>{content}</div>
}
