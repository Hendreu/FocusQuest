// Barrel export for @repo/content-player
export { ContentPlayer } from './ContentPlayer'
export type { ContentPlayerProps, LessonCompleteResult } from './ContentPlayer'

// Components
export { TextLesson } from './components/TextLesson'
export { VideoLesson } from './components/VideoLesson'
export { QuizLesson } from './components/QuizLesson'
export { CodeLesson } from './components/CodeLesson'
export { LessonProgress } from './components/LessonProgress'
export { LessonNavigation } from './components/LessonNavigation'
export { CompletionModal } from './components/CompletionModal'

// Hooks
export { useLessonContent } from './hooks/useLessonContent'
export { useQuizState } from './hooks/useQuizState'
export { useVideoProgress } from './hooks/useVideoProgress'
export { useCodeExecution } from './hooks/useCodeExecution'
