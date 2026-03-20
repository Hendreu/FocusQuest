'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/auth/auth-store'
import type { LeaderboardEntry } from '@repo/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface LeaderboardData {
  entries: LeaderboardEntry[]
  loading: boolean
  error: Error | null
  myRank: number | null
}

export function useLeaderboard(type: 'weekly' | 'all_time'): LeaderboardData {
  const { accessToken } = useAuthStore()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [myRank, setMyRank] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true
    const abortController = new AbortController()

    const fetchLeaderboard = async () => {
      if (!accessToken) return
      setLoading(true)
      try {
        const headers = {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }

        const [listRes, meRes] = await Promise.all([
          fetch(`${API_URL}/gamification/leaderboard?type=${type}`, {
            headers,
            signal: abortController.signal,
          }),
          fetch(`${API_URL}/gamification/leaderboard/me`, {
            headers,
            signal: abortController.signal,
          }),
        ])

        if (!listRes.ok || !meRes.ok) {
          throw new Error('Failed to fetch leaderboard data')
        }

        const listData = await listRes.json()
        const meData = await meRes.json()

        if (mounted) {
          setEntries(listData.data || [])
          setMyRank(meData.rank || null)
          setError(null)
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchLeaderboard()

    return () => {
      mounted = false
      abortController.abort()
    }
  }, [type, accessToken])

  return { entries, loading, error, myRank }
}
