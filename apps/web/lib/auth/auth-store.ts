'use client'

import { create } from 'zustand'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  plan: string
  avatarUrl: string | null
  onboardingCompleted: boolean
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  setAuth: (user: AuthUser, accessToken: string) => void
  clearAuth: () => void
}

// User is persisted in localStorage; access token lives in memory only
const USER_STORAGE_KEY = 'focusquest:user'

function loadUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: loadUser(),
  accessToken: null,

  setAuth: (user, accessToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    }
    set({ user, accessToken })
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
    set({ user: null, accessToken: null })
  },
}))
