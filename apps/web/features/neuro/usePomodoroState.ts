import { useReducer, useEffect, useRef } from 'react'

export type PomodoroPhase = 'idle' | 'focus' | 'short-break' | 'long-break'

export interface PomodoroState {
  phase: PomodoroPhase
  secondsRemaining: number
  sessionCount: number
}

type PomodoroAction =
  | { type: 'START'; focusDurationMinutes: number }
  | { type: 'TICK' }
  | { type: 'SKIP_BREAK'; focusDurationMinutes: number }
  | { type: 'PAUSE' }
  | { type: 'RESET' }

function pomodoroReducer(
  state: PomodoroState,
  action: PomodoroAction,
): PomodoroState {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        phase: 'focus',
        secondsRemaining: action.focusDurationMinutes * 60,
      }

    case 'TICK': {
      if (state.secondsRemaining > 1) {
        return { ...state, secondsRemaining: state.secondsRemaining - 1 }
      }
      // Timer expired — transition
      if (state.phase === 'focus') {
        const newCount = state.sessionCount + 1
        const isLongBreak = newCount % 4 === 0
        return {
          phase: isLongBreak ? 'long-break' : 'short-break',
          secondsRemaining: isLongBreak ? 15 * 60 : 5 * 60,
          sessionCount: newCount,
        }
      }
      // Break ended — back to idle
      return {
        phase: 'idle',
        secondsRemaining: 0,
        sessionCount: state.sessionCount,
      }
    }

    case 'SKIP_BREAK':
      return {
        ...state,
        phase: 'focus',
        secondsRemaining: action.focusDurationMinutes * 60,
      }

    case 'PAUSE':
      return { ...state, phase: 'idle' }

    case 'RESET':
      return { phase: 'idle', secondsRemaining: 0, sessionCount: 0 }

    default:
      return state
  }
}

export function usePomodoroState(focusDurationMinutes: number) {
  const [state, dispatch] = useReducer(pomodoroReducer, {
    phase: 'idle',
    secondsRemaining: 0,
    sessionCount: 0,
  })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const isRunning =
      state.phase === 'focus' ||
      state.phase === 'short-break' ||
      state.phase === 'long-break'

    if (isRunning) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK' })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [state.phase])

  return {
    state,
    start: () => dispatch({ type: 'START', focusDurationMinutes }),
    skipBreak: () => dispatch({ type: 'SKIP_BREAK', focusDurationMinutes }),
    pause: () => dispatch({ type: 'PAUSE' }),
    reset: () => dispatch({ type: 'RESET' }),
  }
}
