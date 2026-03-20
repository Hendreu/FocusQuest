// users.service.ts — Business logic for user profile and preferences
import { eq } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type * as schema from '../../db/schema'
import { users, userPreferences, userLevels, streaks, userBadges, badges, avatars } from '../../db/schema'
import type { UpdatePreferencesInput, UpdateProfileInput } from './users.schema'

type DB = PostgresJsDatabase<typeof schema>

function makeError(message: string, statusCode: number, code: string) {
  return Object.assign(new Error(message), { statusCode, code })
}

export class UsersService {
  constructor(private readonly db: DB) {}

  // ---------------------------------------------------------------------------
  // Get full profile (name, email, role, plan, avatar, preferences, XP/level)
  // ---------------------------------------------------------------------------
  async getMe(userId: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        plan: users.plan,
        onboardingCompleted: users.onboardingCompleted,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      throw makeError('User not found', 404, 'NOT_FOUND')
    }

    // Fetch related data in parallel
    const [prefsRows, levelRows, streakRows, badgeRows, avatarRows] = await Promise.all([
      this.db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId))
        .limit(1),
      this.db
        .select()
        .from(userLevels)
        .where(eq(userLevels.userId, userId))
        .limit(1),
      this.db
        .select()
        .from(streaks)
        .where(eq(streaks.userId, userId))
        .limit(1),
      this.db
        .select({
          id: userBadges.id,
          earnedAt: userBadges.earnedAt,
          badgeId: userBadges.badgeId,
          name: badges.name,
          iconUrl: badges.iconUrl,
          slug: badges.slug,
        })
        .from(userBadges)
        .innerJoin(badges, eq(userBadges.badgeId, badges.id))
        .where(eq(userBadges.userId, userId))
        .orderBy(userBadges.earnedAt),
      this.db
        .select()
        .from(avatars)
        .where(eq(avatars.userId, userId))
        .limit(1),
    ])

    return {
      ...user,
      preferences: prefsRows[0] ?? null,
      level: levelRows[0] ?? { userId, currentXp: 0, level: 1 },
      streak: streakRows[0] ?? { userId, currentStreak: 0, longestStreak: 0 },
      badges: badgeRows,
      avatar: avatarRows[0] ?? null,
    }
  }

  // ---------------------------------------------------------------------------
  // Update profile (name only — email not user-editable)
  // ---------------------------------------------------------------------------
  async updateProfile(userId: string, data: UpdateProfileInput) {
    const [updated] = await this.db
      .update(users)
      .set({ name: data.name, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        plan: users.plan,
      })

    if (!updated) {
      throw makeError('User not found', 404, 'NOT_FOUND')
    }

    return updated
  }

  // ---------------------------------------------------------------------------
  // Get preferences
  // ---------------------------------------------------------------------------
  async getPreferences(userId: string) {
    // Return existing or create defaults
    const [prefs] = await this.db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1)

    if (prefs) return prefs

    // Create default preferences
    const [created] = await this.db
      .insert(userPreferences)
      .values({ userId })
      .onConflictDoNothing()
      .returning()

    return created ?? null
  }

  // ---------------------------------------------------------------------------
  // Update preferences (partial PATCH — only provided fields updated)
  // ---------------------------------------------------------------------------
  async updatePreferences(userId: string, data: UpdatePreferencesInput) {
    // Map input fields → schema columns
    const patch: Record<string, unknown> = {}

    if (data.theme !== undefined) patch.theme = data.theme
    if (data.font_size !== undefined) patch.fontSize = data.font_size
    if (data.language !== undefined) patch.language = data.language
    if (data.animations_enabled !== undefined) patch.animationsEnabled = data.animations_enabled
    if (data.sounds_enabled !== undefined) patch.soundEnabled = data.sounds_enabled
    if (data.focus_duration_minutes !== undefined)
      patch.focusDurationMinutes = data.focus_duration_minutes

    // sensory_profile, animationsIntensity, soundsVolume, hapticFeedback, leaderboard etc.
    // store as part of sensoryProfile jsonb (merged)
    if (
      data.sensory_profile !== undefined ||
      data.animations_intensity !== undefined ||
      data.sounds_volume !== undefined ||
      data.haptic_feedback_enabled !== undefined ||
      data.break_duration_minutes !== undefined ||
      data.leaderboard_visible !== undefined ||
      data.achievement_feed_visible !== undefined
    ) {
      // Fetch existing sensoryProfile to merge
      const [existing] = await this.db
        .select({ sensoryProfile: userPreferences.sensoryProfile })
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId))
        .limit(1)

      const currentProfile = (existing?.sensoryProfile ?? {}) as Record<string, unknown>

      const merged = {
        ...currentProfile,
        ...(data.sensory_profile !== undefined && { ...data.sensory_profile }),
        ...(data.animations_intensity !== undefined && {
          animations_intensity: data.animations_intensity,
        }),
        ...(data.sounds_volume !== undefined && { sounds_volume: data.sounds_volume }),
        ...(data.haptic_feedback_enabled !== undefined && {
          haptic_feedback_enabled: data.haptic_feedback_enabled,
        }),
        ...(data.break_duration_minutes !== undefined && {
          break_duration_minutes: data.break_duration_minutes,
        }),
        ...(data.leaderboard_visible !== undefined && {
          leaderboard_visible: data.leaderboard_visible,
        }),
        ...(data.achievement_feed_visible !== undefined && {
          achievement_feed_visible: data.achievement_feed_visible,
        }),
      }

      patch.sensoryProfile = merged
    }

    if (Object.keys(patch).length === 0) {
      return this.getPreferences(userId)
    }

    // Upsert preferences
    const [updated] = await this.db
      .insert(userPreferences)
      .values({ userId, ...patch })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: patch,
      })
      .returning()

    return updated
  }
}
