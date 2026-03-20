import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// useQuizState tests
import { useQuizState } from './hooks/useQuizState'
import type { QuizContent } from '@repo/types'

// useVideoProgress tests
import { useVideoProgress } from './hooks/useVideoProgress'

// useCodeExecution tests
import { useCodeExecution } from './hooks/useCodeExecution'

// ─── Mock quiz data ───────────────────────────────────────────────────────────

const mockQuiz: QuizContent = {
  type: 'quiz',
  passingScore: 60,
  questions: [
    {
      id: 'q1',
      text: 'What is 2+2?',
      type: 'multiple_choice',
      options: [
        { id: 'a', text: '3', isCorrect: false, feedback: 'Not quite' },
        { id: 'b', text: '4', isCorrect: true, feedback: 'Correct!' },
        { id: 'c', text: '5', isCorrect: false },
      ],
    },
    {
      id: 'q2',
      text: 'Is the sky blue?',
      type: 'true_false',
      options: [
        { id: 'true', text: 'True', isCorrect: true },
        { id: 'false', text: 'False', isCorrect: false },
      ],
    },
  ],
}

// ─── useQuizState tests ───────────────────────────────────────────────────────

describe('useQuizState', () => {
  it('initialises with first question and no answers', () => {
    const { result } = renderHook(() => useQuizState(mockQuiz))
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.currentQuestion?.id).toBe('q1')
    expect(result.current.currentAnswer?.selectedOptionId).toBeNull()
    expect(result.current.isFinished).toBe(false)
  })

  it('selectOption updates selected option', () => {
    const { result } = renderHook(() => useQuizState(mockQuiz))
    act(() => result.current.selectOption('b'))
    expect(result.current.currentAnswer?.selectedOptionId).toBe('b')
  })

  it('submitAnswer marks correct answers', () => {
    const { result } = renderHook(() => useQuizState(mockQuiz))
    act(() => result.current.selectOption('b'))
    act(() => result.current.submitAnswer())
    expect(result.current.currentAnswer?.isCorrect).toBe(true)
    expect(result.current.currentAnswer?.submitted).toBe(true)
  })

  it('submitAnswer marks incorrect answers', () => {
    const { result } = renderHook(() => useQuizState(mockQuiz))
    act(() => result.current.selectOption('a'))
    act(() => result.current.submitAnswer())
    expect(result.current.currentAnswer?.isCorrect).toBe(false)
  })

  it('nextQuestion advances index', () => {
    const { result } = renderHook(() => useQuizState(mockQuiz))
    act(() => result.current.selectOption('b'))
    act(() => result.current.submitAnswer())
    act(() => result.current.nextQuestion())
    expect(result.current.currentIndex).toBe(1)
    expect(result.current.currentQuestion?.id).toBe('q2')
  })

  it('isFinished becomes true after last nextQuestion', () => {
    const { result } = renderHook(() => useQuizState(mockQuiz))
    // Q1
    act(() => result.current.selectOption('b'))
    act(() => result.current.submitAnswer())
    act(() => result.current.nextQuestion())
    // Q2
    act(() => result.current.selectOption('true'))
    act(() => result.current.submitAnswer())
    act(() => result.current.nextQuestion())
    expect(result.current.isFinished).toBe(true)
  })

  it('score counts correct answers', () => {
    const { result } = renderHook(() => useQuizState(mockQuiz))
    act(() => result.current.selectOption('b'))
    act(() => result.current.submitAnswer())
    act(() => result.current.nextQuestion())
    act(() => result.current.selectOption('true'))
    act(() => result.current.submitAnswer())
    act(() => result.current.nextQuestion())
    expect(result.current.score).toBe(2)
  })

  it('reset clears state', () => {
    const { result } = renderHook(() => useQuizState(mockQuiz))
    act(() => result.current.selectOption('b'))
    act(() => result.current.submitAnswer())
    act(() => result.current.nextQuestion())
    act(() => result.current.reset())
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.score).toBe(0)
  })

  it('returns empty state with null quiz', () => {
    const { result } = renderHook(() => useQuizState(null))
    expect(result.current.totalQuestions).toBe(0)
    expect(result.current.currentQuestion).toBeNull()
  })

  it('does not change answer after submitted', () => {
    const { result } = renderHook(() => useQuizState(mockQuiz))
    act(() => result.current.selectOption('b'))
    act(() => result.current.submitAnswer())
    // Try to select a different option after submit
    act(() => result.current.selectOption('a'))
    // Should still be 'b' since submitted
    expect(result.current.currentAnswer?.selectedOptionId).toBe('b')
  })
})

// ─── useVideoProgress tests ───────────────────────────────────────────────────

describe('useVideoProgress', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initialises with 0 progress', () => {
    const { result } = renderHook(() => useVideoProgress('lesson-123'))
    expect(result.current.progress).toBe(0)
    expect(result.current.isCompleted).toBe(false)
  })

  it('updates progress on timeUpdate', () => {
    const { result } = renderHook(() => useVideoProgress('lesson-abc'))
    act(() => result.current.onTimeUpdate(50, 100))
    expect(result.current.progress).toBe(50)
  })

  it('marks completed at >= 90%', () => {
    const { result } = renderHook(() => useVideoProgress('lesson-abc'))
    act(() => result.current.onTimeUpdate(91, 100))
    expect(result.current.isCompleted).toBe(true)
  })

  it('reads saved position from localStorage', () => {
    localStorage.setItem('focusquest:video:lesson-xyz', '42')
    const { result } = renderHook(() => useVideoProgress('lesson-xyz'))
    expect(result.current.savedPosition).toBe(42)
  })

  it('handles 0 duration gracefully', () => {
    const { result } = renderHook(() => useVideoProgress('lesson-abc'))
    act(() => result.current.onTimeUpdate(0, 0))
    expect(result.current.progress).toBe(0)
  })
})

// ─── useCodeExecution tests ───────────────────────────────────────────────────

describe('useCodeExecution', () => {
  it('initialises with null output', () => {
    const { result } = renderHook(() => useCodeExecution('http://localhost:3001', null))
    expect(result.current.output).toBeNull()
    expect(result.current.isRunning).toBe(false)
    expect(result.current.hasPassedAllTests).toBe(false)
  })

  it('executes and sets output on success', async () => {
    const mockResponse = {
      data: {
        stdout: 'Hello World\n',
        stderr: '',
        exit_code: 0,
        tests_results: [{ name: 'test1', passed: true }],
      },
    }
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as unknown as Response)

    const { result } = renderHook(() => useCodeExecution('http://localhost:3001', 'token-abc'))

    await act(async () => {
      await result.current.execute('python', 'print("Hello World")')
    })

    expect(result.current.output?.stdout).toBe('Hello World\n')
    expect(result.current.output?.exitCode).toBe(0)
    expect(result.current.hasPassedAllTests).toBe(true)
  })

  it('sets stderr on network error', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useCodeExecution('http://localhost:3001', null))

    await act(async () => {
      await result.current.execute('javascript', 'console.log(1)')
    })

    expect(result.current.output?.stderr).toBe('Network error')
    expect(result.current.output?.exitCode).toBe(1)
  })

  it('hasPassedAllTests is false when any test fails', async () => {
    const mockResponse = {
      data: {
        stdout: '',
        stderr: '',
        exit_code: 1,
        tests_results: [
          { name: 'test1', passed: true },
          { name: 'test2', passed: false },
        ],
      },
    }
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as unknown as Response)

    const { result } = renderHook(() => useCodeExecution('http://localhost:3001', null))

    await act(async () => {
      await result.current.execute('python', 'x = 1')
    })

    expect(result.current.hasPassedAllTests).toBe(false)
  })
})
