// BadgeService.ts — check and award badges based on criteria
import { EventEmitter } from 'events'
import type { UserBadge, Badge, BadgeCriteria } from '@repo/types'

export interface UserStats {
  totalLessonsCompleted: number
  currentStreak: number
  longestStreak: number
  currentLevel: number
  totalXp: number
  totalQuestsCompleted: number
}

export class BadgeService {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly db: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly schema: any,
    private readonly emitter: EventEmitter,
  ) {}

  private evaluateCriteria(badge: Badge, stats: UserStats): boolean {
    const criteria = badge.criteria as BadgeCriteria
    switch (criteria.type) {
      case 'lesson_count':
        return stats.totalLessonsCompleted >= criteria.threshold
      case 'streak_days':
        return (
          stats.currentStreak >= criteria.threshold ||
          stats.longestStreak >= criteria.threshold
        )
      case 'level_reached':
        return stats.currentLevel >= criteria.threshold
      case 'xp_total':
        return stats.totalXp >= criteria.threshold
      case 'quest_count':
        return stats.totalQuestsCompleted >= criteria.threshold
      default:
        return false
    }
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const { eq } = await import('drizzle-orm')
    const rows = await this.db
      .select({
        id: this.schema.userBadges.id,
        userId: this.schema.userBadges.userId,
        badgeId: this.schema.userBadges.badgeId,
        earnedAt: this.schema.userBadges.earnedAt,
        badge: {
          id: this.schema.badges.id,
          slug: this.schema.badges.slug,
          name: this.schema.badges.name,
          description: this.schema.badges.description,
          iconUrl: this.schema.badges.iconUrl,
          criteria: this.schema.badges.criteria,
          isPremium: this.schema.badges.isPremium,
        },
      })
      .from(this.schema.userBadges)
      .leftJoin(
        this.schema.badges,
        eq(this.schema.userBadges.badgeId, this.schema.badges.id),
      )
      .where(eq(this.schema.userBadges.userId, userId))

    return rows.map(
      (r: {
        id: string
        userId: string
        badgeId: string
        earnedAt: Date
        badge: Badge | null
      }) => ({
        id: r.id,
        userId: r.userId,
        badgeId: r.badgeId,
        earnedAt: r.earnedAt.toISOString(),
        badge: r.badge ?? undefined,
      }),
    )
  }

  async checkAndAward(
    userId: string,
    eventType: string,
    context: Record<string, unknown>,
  ): Promise<UserBadge[]> {
    const { eq, inArray } = await import('drizzle-orm')

    // Get all badges
    const allBadges: Badge[] = await this.db
      .select()
      .from(this.schema.badges)

    // Get badges user already has
    const existingBadges = await this.db
      .select({ badgeId: this.schema.userBadges.badgeId })
      .from(this.schema.userBadges)
      .where(eq(this.schema.userBadges.userId, userId))

    const existingBadgeIds = new Set(
      existingBadges.map((b: { badgeId: string }) => b.badgeId),
    )

    // Build user stats from context
    const stats: UserStats = {
      totalLessonsCompleted:
        (context['totalLessonsCompleted'] as number) ?? 0,
      currentStreak: (context['currentStreak'] as number) ?? 0,
      longestStreak: (context['longestStreak'] as number) ?? 0,
      currentLevel: (context['currentLevel'] as number) ?? 1,
      totalXp: (context['totalXp'] as number) ?? 0,
      totalQuestsCompleted:
        (context['totalQuestsCompleted'] as number) ?? 0,
    }

    const newlyEarned: UserBadge[] = []

    for (const badge of allBadges) {
      // Skip if already earned
      if (existingBadgeIds.has(badge.id)) continue

      // Check if this badge criteria type is relevant to the event
      const criteria = badge.criteria as BadgeCriteria
      const relevantEvents: Record<string, string[]> = {
        lesson_count: ['lesson_completed', 'xp_awarded'],
        streak_days: ['streak.updated'],
        level_reached: ['level.up', 'xp_awarded'],
        xp_total: ['xp_awarded'],
        quest_count: ['quest.completed'],
      }

      const relevantForEvent =
        relevantEvents[criteria.type]?.includes(eventType) ?? false
      if (!relevantForEvent) continue

      if (this.evaluateCriteria(badge, stats)) {
        const [awarded] = await this.db
          .insert(this.schema.userBadges)
          .values({ userId, badgeId: badge.id })
          .returning()

        const userBadge: UserBadge = {
          id: awarded.id,
          userId: awarded.userId,
          badgeId: awarded.badgeId,
          earnedAt: awarded.earnedAt.toISOString(),
          badge,
        }

        newlyEarned.push(userBadge)
        this.emitter.emit('badge.earned', { userId, badge })
      }
    }

    return newlyEarned
  }
}
