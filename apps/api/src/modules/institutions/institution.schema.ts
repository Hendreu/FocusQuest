import { z } from 'zod'

export const createInstitutionSchema = z.object({
  name: z.string().min(3).max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .min(3)
    .max(50),
  license_seats: z.number().int().min(1).max(10000),
})

export const updateInstitutionSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .min(3)
    .max(50)
    .optional(),
})

export const generateInviteSchema = z.object({
  role: z.enum(['student']),
  class_id: z.string().uuid().optional(),
})

export const acceptInviteSchema = z.object({
  token: z.string().min(10),
})

export type CreateInstitutionInput = z.infer<typeof createInstitutionSchema>
export type UpdateInstitutionInput = z.infer<typeof updateInstitutionSchema>
export type GenerateInviteInput = z.infer<typeof generateInviteSchema>
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>

export interface InstitutionStats {
  active_students: number
  seats_used: number
  seats_total: number
  avg_progress_percent: number
  active_streaks_count: number
  badges_earned_this_week: number
  top_students: Array<{
    user_id: string
    name: string
    xp: number
    level: number
    avatar_url?: string
  }>
}
