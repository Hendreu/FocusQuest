'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { apiClient } from '../lib/auth/api-client'
import { useAuthStore } from '../lib/auth/auth-store'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SensoryProfile {
  motion_sensitivity?: 'low' | 'medium' | 'high'
  sound_preference?: 'off' | 'subtle' | 'full'
  contrast_preference?: 'normal' | 'high'
  pace_preference?: 'slow' | 'normal' | 'fast'
  animations_intensity?: number
  sounds_volume?: number
  haptic_feedback_enabled?: boolean
  break_duration_minutes?: number
  leaderboard_visible?: boolean
  achievement_feed_visible?: boolean
}

export interface UserPreferencesData {
  userId: string
  theme: 'light' | 'dark' | 'high-contrast'
  fontSize: 'normal' | 'large' | 'xlarge'
  language: 'pt-BR' | 'en'
  animationsEnabled: boolean
  soundEnabled: boolean
  focusDurationMinutes: number
  sensoryProfile: SensoryProfile
  notificationSettings: Record<string, boolean>
}

export interface PreferencesContextValue {
  preferences: UserPreferencesData | null
  isLoading: boolean
  updatePreferences: (patch: Partial<PreferencesInput>) => Promise<void>
}

export interface PreferencesInput {
  theme?: 'light' | 'dark' | 'high-contrast'
  font_size?: 'normal' | 'large' | 'xlarge'
  language?: 'pt-BR' | 'en'
  animations_enabled?: boolean
  animations_intensity?: number
  sounds_enabled?: boolean
  sounds_volume?: number
  haptic_feedback_enabled?: boolean
  focus_duration_minutes?: 15 | 25 | 45
  break_duration_minutes?: 5 | 10
  sensory_profile?: SensoryProfile
  leaderboard_visible?: boolean
  achievement_feed_visible?: boolean
}

const STORAGE_KEY = 'focusquest:preferences'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const PreferencesContext = createContext<PreferencesContextValue>({
  preferences: null,
  isLoading: true,
  updatePreferences: async () => {},
})

// ---------------------------------------------------------------------------
// Apply preferences to DOM
// ---------------------------------------------------------------------------

function applyPreferencesToDOM(prefs: UserPreferencesData) {
  if (typeof document === 'undefined') return

  const html = document.documentElement

  html.setAttribute('data-theme', prefs.theme)
  html.setAttribute('data-font-size', prefs.fontSize)

  const intensity = (prefs.sensoryProfile?.animations_intensity ?? 100)
  const animOn = prefs.animationsEnabled && intensity > 0
  html.setAttribute('data-animations', animOn ? 'on' : 'off')
  html.style.setProperty('--animation-intensity', `${intensity}%`)
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore()
  const [preferences, setPreferences] = useState<UserPreferencesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Apply from cache immediately (avoid flash)
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached) as UserPreferencesData
        setPreferences(parsed)
        applyPreferencesToDOM(parsed)
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  // Fetch from server when authenticated
  useEffect(() => {
    if (!accessToken) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function fetchPreferences() {
      try {
        const data = await apiClient<UserPreferencesData>('/users/me/preferences')
        if (cancelled) return
        setPreferences(data)
        applyPreferencesToDOM(data)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch {
        // Non-critical — use cached or defaults
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void fetchPreferences()
    return () => { cancelled = true }
  }, [accessToken])

  const updatePreferences = useCallback(async (patch: Partial<PreferencesInput>) => {
    const updated = await apiClient<UserPreferencesData>('/users/me/preferences', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    setPreferences(updated)
    applyPreferencesToDOM(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }, [])

  return (
    <PreferencesContext.Provider value={{ preferences, isLoading, updatePreferences }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences(): PreferencesContextValue {
  return useContext(PreferencesContext)
}
