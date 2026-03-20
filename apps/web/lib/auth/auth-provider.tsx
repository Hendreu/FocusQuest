'use client'

import { useEffect } from 'react'
import { useAuthStore } from './auth-store'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

/**
 * AuthProvider
 * On mount, attempts to silently refresh the session using the httpOnly
 * refreshToken cookie. If successful, stores the new access token in memory.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    async function attemptRefresh() {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // sends the httpOnly refreshToken cookie
        })

        if (!res.ok) {
          clearAuth()
          return
        }

        const data = (await res.json()) as { accessToken: string }

        // Fetch the current user with the new token
        const meRes = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${data.accessToken}` },
          credentials: 'include',
        })

        if (!meRes.ok) {
          clearAuth()
          return
        }

        const meData = (await meRes.json()) as { user: Parameters<typeof setAuth>[0] }
        setAuth(meData.user, data.accessToken)
      } catch {
        // Network error or no cookie — not authenticated; silently proceed
      }
    }

    void attemptRefresh()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>
}
