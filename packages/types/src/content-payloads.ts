export interface TextContent {
  type: 'text'
  markdown: string
}

export interface VideoContent {
  type: 'video'
  url: string
  embedUrl?: string
  captionsUrl?: string
  thumbnailUrl?: string
}

export interface QuizQuestion {
  id: string
  text: string
  type: 'multiple_choice' | 'true_false' | 'drag_drop'
  options: {
    id: string
    text: string
    isCorrect: boolean
    feedback?: string
  }[]
}

export interface QuizContent {
  type: 'quiz'
  questions: QuizQuestion[]
  passingScore: number
}

export interface CodeContent {
  type: 'code'
  language: 'python' | 'javascript' | 'typescript'
  starterCode: string
  solution: string
  tests: { description: string; code: string }[]
}

export type LessonPayload = TextContent | VideoContent | QuizContent | CodeContent
