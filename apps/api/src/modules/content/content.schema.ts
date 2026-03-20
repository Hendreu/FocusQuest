// content.schema.ts — Zod validation schemas for content DTOs
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Course
// ---------------------------------------------------------------------------

export const createCourseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  language: z.enum(['pt-BR', 'en']),
  thumbnail_url: z.string().url().optional(),
})

export const updateCourseSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  language: z.enum(['pt-BR', 'en']).optional(),
  thumbnail_url: z.string().url().optional(),
})

export const courseStatusSchema = z.object({
  status: z.enum(['draft', 'review', 'published', 'archived']),
})

// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------

export const createModuleSchema = z.object({
  title: z.string().min(1).max(255),
  order: z.number().int().min(0),
})

export const updateModuleSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  order: z.number().int().min(0).optional(),
})

export const reorderSchema = z.array(
  z.object({
    id: z.string().uuid(),
    order: z.number().int().min(0),
  }),
)

// ---------------------------------------------------------------------------
// Lesson
// ---------------------------------------------------------------------------

export const createLessonSchema = z.object({
  title: z.string().min(3).max(200),
  content_type: z.enum(['text', 'video', 'quiz', 'code']),
  duration_minutes: z.number().min(1).max(5), // MICROLEARNING RULE: max 5 min
  is_premium: z.boolean().default(false),
  order: z.number().int().min(0),
})

export const updateLessonSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content_type: z.enum(['text', 'video', 'quiz', 'code']).optional(),
  duration_minutes: z.number().min(1).max(5).optional(),
  is_premium: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
})

// ---------------------------------------------------------------------------
// Lesson content payloads (JSONB)
// ---------------------------------------------------------------------------

export const textContentSchema = z.object({
  markdown: z.string(),
  images: z.array(z.string().url()).default([]),
})

export const videoContentSchema = z.object({
  video_url: z.string().url(),
  captions_url: z.string().url().optional(),
  embed_url: z.string().url().optional(),
})

export const quizQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()).min(2).max(6),
  correct_index: z.number().int().min(0),
  explanation: z.string().optional(),
})

export const quizContentSchema = z.object({
  questions: z.array(quizQuestionSchema).min(1),
})

export const codeContentSchema = z.object({
  language: z.enum(['python', 'javascript']),
  starter_code: z.string(),
  solution: z.string(),
  tests: z.array(z.string()),
})

export const lessonContentPayloadSchema = z.union([
  textContentSchema,
  videoContentSchema,
  quizContentSchema,
  codeContentSchema,
])

export const saveLessonContentSchema = z.object({
  payload: z.record(z.string(), z.unknown()), // accept any JSON, validated by content type
})

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
export type CourseStatusInput = z.infer<typeof courseStatusSchema>
export type CreateModuleInput = z.infer<typeof createModuleSchema>
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>
export type ReorderInput = z.infer<typeof reorderSchema>
export type CreateLessonInput = z.infer<typeof createLessonSchema>
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>
export type SaveLessonContentInput = z.infer<typeof saveLessonContentSchema>
