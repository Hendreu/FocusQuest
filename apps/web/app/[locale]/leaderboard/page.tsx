'use client'

import React, { useState } from 'react'
import { LeaderboardTabs } from '@/features/leaderboard/LeaderboardTabs'
import { LeaderboardList } from '@/features/leaderboard/LeaderboardList'
import { MyPositionCard } from '@/features/leaderboard/MyPositionCard'
import { AchievementFeed } from '@/features/leaderboard/AchievementFeed'
import { useLeaderboard } from '@/hooks/useLeaderboard'

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'weekly' | 'all_time'>('weekly')
  const { entries, loading, myRank, error } = useLeaderboard(activeTab)

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        height: '100%',
        minHeight: '100vh',
      }}
    >
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--color-text)' }}>
          Leaderboard
        </h1>
        <p style={{ margin: 0, color: 'var(--color-muted)' }}>
          Acompanhe seu progresso e veja como você se compara a outros estudantes.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 350px',
          gap: '24px',
          flex: 1,
          minHeight: 0, // important for nested scrolling
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <LeaderboardTabs activeTab={activeTab} onChange={setActiveTab} />
          
          <div
            style={{
              flex: 1,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            {error ? (
              <div style={{ color: 'red', textAlign: 'center', padding: '24px' }}>
                Erro ao carregar o leaderboard: {error.message}
              </div>
            ) : (
              <LeaderboardList entries={entries} loading={loading} />
            )}
          </div>

          <div style={{ marginTop: '24px' }}>
            <MyPositionCard myRank={myRank} loading={loading} />
          </div>
        </div>

        <div style={{ minHeight: 0, height: 'calc(100vh - 150px)', position: 'sticky', top: '24px' }}>
          <AchievementFeed />
        </div>
      </div>
    </div>
  )
}
