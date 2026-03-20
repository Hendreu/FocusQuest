import { z } from 'zod'

export const updatePreferencesSchema = z
  .object({
    theme: z.enum(['light', 'dark', 'high-contrast']).optional(),
    font_size: z.enum(['normal', 'large', 'xlarge']).optional(),
    language: z.enum(['pt-BR', 'en']).optional(),
    animations_enabled: z.boolean().optional(),
    animations_intensity: z.number().min(0).max(100).optional(),
    sounds_enabled: z.boolean().optional(),
    sounds_volume: z.number().min(0).max(100).optional(),
    haptic_feedback_enabled: z.boolean().optional(),
    focus_duration_minutes: z.union([z.literal(15), z.literal(25), z.literal(45)]).optional(),
    break_duration_minutes: z.union([z.literal(5), z.literal(10)]).optional(),
    sensory_profile: z
      .object({
        motion_sensitivity: z.enum(['low', 'medium', 'high']),
        sound_preference: z.enum(['off', 'subtle', 'full']),
        contrast_preference: z.enum(['normal', 'high']),
        pace_preference: z.enum(['slow', 'normal', 'fast']),
      })
      .optional(),
    leaderboard_visible: z.boolean().optional(),
    achievement_feed_visible: z.boolean().optional(),
  })
  .strict()

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(255),
})

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
