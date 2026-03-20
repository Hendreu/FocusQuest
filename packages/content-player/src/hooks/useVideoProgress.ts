import { useState, useCallback, useRef } from 'react'

const SAVE_INTERVAL_MS = 10_000

interface UseVideoProgressResult {
  progress: number          // 0-100
  isCompleted: boolean      // true when >= 90% watched
  savedPosition: number     // seconds
  onTimeUpdate: (currentTime: number, duration: number) => void
  onLoadedMetadata: (duration: number) => void
}

export function useVideoProgress(lessonId: string): UseVideoProgressResult {
  const storageKey = `focusquest:video:${lessonId}`

  const getSavedPosition = (): number => {
    if (typeof localStorage === 'undefined') return 0
    try {
      return Number(localStorage.getItem(storageKey) ?? '0')
    } catch {
      return 0
    }
  }

  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [savedPosition] = useState<number>(getSavedPosition)
  const lastSaveRef = useRef(0)

  const onLoadedMetadata = useCallback((_duration: number) => {
    // Duration available — nothing to do here; savedPosition already read
  }, [])

  const onTimeUpdate = useCallback((currentTime: number, duration: number) => {
    if (duration <= 0) return

    const pct = Math.min(100, (currentTime / duration) * 100)
    setProgress(pct)

    if (pct >= 90) setIsCompleted(true)

    // Save position every SAVE_INTERVAL_MS
    const now = Date.now()
    if (now - lastSaveRef.current > SAVE_INTERVAL_MS) {
      lastSaveRef.current = now
      try {
        localStorage.setItem(storageKey, String(Math.floor(currentTime)))
      } catch {
        // Ignore storage errors
      }
    }
  }, [storageKey])

  return { progress, isCompleted, savedPosition, onTimeUpdate, onLoadedMetadata }
}
