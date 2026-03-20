import { useCallback } from 'react'
import { usePreferences } from '@/hooks/usePreferences'

// Create a tone using the Web Audio API
function createTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
): void {
  try {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
    oscillator.type = type
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
    // Close context after sound plays
    setTimeout(() => void ctx.close(), (duration + 0.1) * 1000)
  } catch {
    // AudioContext not available (SSR, unsupported browser) — silent fail
  }
}

export function useSensoryFeedback() {
  const { preferences } = usePreferences()
  const soundsEnabled = preferences?.soundEnabled ?? false

  const playXPSound = useCallback(() => {
    if (!soundsEnabled) return
    createTone(880, 0.15)
  }, [soundsEnabled])

  const playLevelUpSound = useCallback(() => {
    if (!soundsEnabled) return
    createTone(523, 0.1)
    setTimeout(() => createTone(659, 0.1), 100)
    setTimeout(() => createTone(784, 0.2), 200)
  }, [soundsEnabled])

  const playStreakSound = useCallback(() => {
    if (!soundsEnabled) return
    createTone(440, 0.1)
    setTimeout(() => createTone(554, 0.15), 120)
  }, [soundsEnabled])

  const playCorrectSound = useCallback(() => {
    if (!soundsEnabled) return
    createTone(660, 0.15)
  }, [soundsEnabled])

  const playWrongSound = useCallback(() => {
    if (!soundsEnabled) return
    createTone(220, 0.2, 'sawtooth')
  }, [soundsEnabled])

  const vibrate = useCallback((pattern: number[]) => {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return
    navigator.vibrate(pattern)
  }, [])

  return {
    playXPSound,
    playLevelUpSound,
    playStreakSound,
    playCorrectSound,
    playWrongSound,
    vibrate,
  }
}
