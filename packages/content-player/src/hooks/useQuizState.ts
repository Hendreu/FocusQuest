import { useState, useCallback } from 'react'
import type { QuizContent, QuizQuestion } from '@repo/types'

interface AnswerState {
  questionId: string
  selectedOptionId: string | null
  isCorrect: boolean | null
  submitted: boolean
}

interface UseQuizStateResult {
  currentIndex: number
  answers: AnswerState[]
  score: number
  totalQuestions: number
  isFinished: boolean
  currentQuestion: QuizQuestion | null
  currentAnswer: AnswerState | null
  selectOption: (optionId: string) => void
  submitAnswer: () => void
  nextQuestion: () => void
  reset: () => void
}

export function useQuizState(quiz: QuizContent | null): UseQuizStateResult {
  const questions = quiz?.questions ?? []

  const makeInitialAnswers = (qs: QuizQuestion[]): AnswerState[] =>
    qs.map((q) => ({ questionId: q.id, selectedOptionId: null, isCorrect: null, submitted: false }))

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerState[]>(() => makeInitialAnswers(questions))

  const currentQuestion = questions[currentIndex] ?? null
  const currentAnswer = answers[currentIndex] ?? null

  const score = answers.filter((a) => a.isCorrect === true).length
  const isFinished = currentIndex >= questions.length && questions.length > 0

  const selectOption = useCallback((optionId: string) => {
    setAnswers((prev) => {
      const next = [...prev]
      const current = next[currentIndex]
      if (current && !current.submitted) {
        next[currentIndex] = { ...current, selectedOptionId: optionId }
      }
      return next
    })
  }, [currentIndex])

  const submitAnswer = useCallback(() => {
    if (!currentQuestion || !currentAnswer?.selectedOptionId) return
    const option = currentQuestion.options.find((o) => o.id === currentAnswer.selectedOptionId)
    const isCorrect = option?.isCorrect ?? false

    setAnswers((prev) => {
      const next = [...prev]
      const current = next[currentIndex]
      if (current) {
        next[currentIndex] = { ...current, isCorrect, submitted: true }
      }
      return next
    })
  }, [currentQuestion, currentAnswer, currentIndex])

  const nextQuestion = useCallback(() => {
    setCurrentIndex((i) => i + 1)
  }, [])

  const reset = useCallback(() => {
    setCurrentIndex(0)
    setAnswers(makeInitialAnswers(questions))
  }, [questions])

  return {
    currentIndex,
    answers,
    score,
    totalQuestions: questions.length,
    isFinished,
    currentQuestion,
    currentAnswer,
    selectOption,
    submitAnswer,
    nextQuestion,
    reset,
  }
}
