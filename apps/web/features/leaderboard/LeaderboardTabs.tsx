'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { usePreferences } from '@/hooks/usePreferences'

interface LeaderboardTabsProps {
  activeTab: 'weekly' | 'all_time'
  onChange: (tab: 'weekly' | 'all_time') => void
}

export function LeaderboardTabs({ activeTab, onChange }: LeaderboardTabsProps) {
  const { preferences } = usePreferences()
  const animationsEnabled = preferences?.animationsEnabled ?? true

  const tabs = [
    { id: 'weekly', label: 'Semanal' },
    { id: 'all_time', label: 'All-Time' },
  ] as const

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        padding: '4px',
        background: 'var(--color-surface)',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        width: 'fit-content',
        marginBottom: '24px',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              position: 'relative',
              padding: '8px 16px',
              border: 'none',
              background: 'transparent',
              color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              borderRadius: '8px',
              outline: 'none',
              transition: 'color 0.2s ease',
            }}
          >
            {isActive && animationsEnabled && (
              <motion.div
                layoutId="activeTab"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'var(--color-background)',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  zIndex: 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            {!animationsEnabled && isActive && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'var(--color-background)',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  zIndex: 0,
                }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
