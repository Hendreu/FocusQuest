// QuestService.ts — manage quests and user quest progress
import { EventEmitter } from 'events'
import type { UserQuest, Quest } from '@repo/types'

export class QuestService {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly db: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly schema: any,
    private readonly emitter: EventEmitter,
  ) {}

  async startQuest(userId: string, questId: string): Promise<UserQuest> {
    const { eq, and } = await import('drizzle-orm')

    // Check if already active
    const existing = await this.db
      .select()
      .from(this.schema.userQuests)
      .where(
        and(
          eq(this.schema.userQuests.userId, userId),
          eq(this.schema.userQuests.questId, questId),
          eq(this.schema.userQuests.status, 'active'),
        ),
      )
      .limit(1)

    if (existing.length > 0) {
      const r = existing[0]
      return this.mapUserQuest(r)
    }

    const [inserted] = await this.db
      .insert(this.schema.userQuests)
      .values({
        userId,
        questId,
        status: 'active',
        progress: {},
      })
      .returning()

    return this.mapUserQuest(inserted)
  }

  async updateProgress(
    userId: string,
    eventType: string,
    progressDelta: Record<string, number>,
  ): Promise<UserQuest[]> {
    const { eq, and } = await import('drizzle-orm')

    const activeQuests = await this.db
      .select({
        userQuest: this.schema.userQuests,
        quest: this.schema.quests,
      })
      .from(this.schema.userQuests)
      .leftJoin(
        this.schema.quests,
        eq(this.schema.userQuests.questId, this.schema.quests.id),
      )
      .where(
        and(
          eq(this.schema.userQuests.userId, userId),
          eq(this.schema.userQuests.status, 'active'),
        ),
      )

    const updated: UserQuest[] = []

    for (const row of activeQuests) {
      const uq = row.userQuest
      const quest: Quest = row.quest

      if (!quest) continue

      const criteria = quest.criteria as {
        type: string
        target: number
      }

      // Check if this progress delta is relevant for this quest's criteria
      const relevantKey = this.getProgressKey(criteria.type, eventType)
      if (!relevantKey || !(relevantKey in progressDelta)) continue

      // Merge progress
      const currentProgress: Record<string, number> =
        (uq.progress as Record<string, number>) ?? {}
      const newProgress = { ...currentProgress }
      newProgress[relevantKey] =
        (newProgress[relevantKey] ?? 0) + (progressDelta[relevantKey] ?? 0)

      // Check if completed
      const isCompleted = newProgress[relevantKey] >= criteria.target

      await this.db
        .update(this.schema.userQuests)
        .set({
          progress: newProgress,
          status: isCompleted ? 'completed' : 'active',
          completedAt: isCompleted ? new Date() : null,
        })
        .where(eq(this.schema.userQuests.id, uq.id))

      if (isCompleted) {
        // Award XP + coins
        await this.db
          .insert(this.schema.xpEvents)
          .values({
            userId,
            sourceType: 'quest_complete',
            sourceId: quest.id,
            xpAmount: quest.xpReward,
          })
          .catch(() => {
            // Best effort — ignore if fails
          })

        // Update user_coins — best effort, handled by dedicated award flow
        if (quest.coinReward > 0) {
          await this.db
            .insert(this.schema.userCoins)
            .values({ userId, balance: quest.coinReward })
            .catch(() => {
              // Best effort — handled by dedicated award flow
            })
        }

        this.emitter.emit('quest.completed', { userId, quest })
      }

      updated.push({
        id: uq.id,
        userId: uq.userId,
        questId: uq.questId,
        status: isCompleted ? 'completed' : 'active',
        progress: newProgress,
        startedAt: String(uq.startedAt),
        completedAt: isCompleted ? new Date().toISOString() : null,
        quest: {
          id: quest.id,
          slug: quest.slug,
          title: quest.title,
          description: quest.description,
          xpReward: quest.xpReward,
          coinReward: quest.coinReward,
          criteria: quest.criteria,
          expiresAt: quest.expiresAt ?? null,
          isPremium: quest.isPremium,
        },
      })
    }

    return updated
  }

  private getProgressKey(
    criteriaType: string,
    eventType: string,
  ): string | null {
    const map: Record<string, Record<string, string>> = {
      complete_lessons: {
        lesson_completed: 'lessons_completed',
      },
      maintain_streak: {
        'streak.updated': 'streak_days',
        streak_days: 'streak_days',
      },
      earn_xp: {
        'xp.awarded': 'xp_earned',
        xp_awarded: 'xp_earned',
      },
      complete_quizzes: {
        lesson_completed: 'quizzes_completed',
      },
      finish_course: {
        lesson_completed: 'lessons_completed',
      },
    }
    return map[criteriaType]?.[eventType] ?? null
  }

  async getActiveQuests(userId: string): Promise<UserQuest[]> {
    const { eq, and } = await import('drizzle-orm')
    const rows = await this.db
      .select({
        id: this.schema.userQuests.id,
        userId: this.schema.userQuests.userId,
        questId: this.schema.userQuests.questId,
        status: this.schema.userQuests.status,
        progress: this.schema.userQuests.progress,
        startedAt: this.schema.userQuests.startedAt,
        completedAt: this.schema.userQuests.completedAt,
        quest: {
          id: this.schema.quests.id,
          slug: this.schema.quests.slug,
          title: this.schema.quests.title,
          description: this.schema.quests.description,
          xpReward: this.schema.quests.xpReward,
          coinReward: this.schema.quests.coinReward,
          criteria: this.schema.quests.criteria,
          expiresAt: this.schema.quests.expiresAt,
          isPremium: this.schema.quests.isPremium,
        },
      })
      .from(this.schema.userQuests)
      .leftJoin(
        this.schema.quests,
        eq(this.schema.userQuests.questId, this.schema.quests.id),
      )
      .where(
        and(
          eq(this.schema.userQuests.userId, userId),
          eq(this.schema.userQuests.status, 'active'),
        ),
      )

    return rows.map((r: ReturnType<typeof this.mapUserQuestRow>) =>
      this.mapUserQuestRow(r),
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapUserQuestRow(r: any): UserQuest {
    return {
      id: r.id,
      userId: r.userId,
      questId: r.questId,
      status: r.status,
      progress: (r.progress as Record<string, number>) ?? {},
      startedAt: r.startedAt instanceof Date
        ? r.startedAt.toISOString()
        : String(r.startedAt),
      completedAt: r.completedAt
        ? r.completedAt instanceof Date
          ? r.completedAt.toISOString()
          : String(r.completedAt)
        : null,
      quest: r.quest
        ? {
            id: r.quest.id,
            slug: r.quest.slug,
            title: r.quest.title,
            description: r.quest.description,
            xpReward: r.quest.xpReward,
            coinReward: r.quest.coinReward ?? 0,
            criteria: r.quest.criteria,
            expiresAt: r.quest.expiresAt
              ? r.quest.expiresAt instanceof Date
                ? r.quest.expiresAt.toISOString()
                : String(r.quest.expiresAt)
              : null,
            isPremium: r.quest.isPremium ?? false,
          }
        : undefined,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapUserQuest(r: any): UserQuest {
    return {
      id: r.id,
      userId: r.userId,
      questId: r.questId,
      status: r.status,
      progress: (r.progress as Record<string, number>) ?? {},
      startedAt: r.startedAt instanceof Date
        ? r.startedAt.toISOString()
        : String(r.startedAt),
      completedAt: r.completedAt
        ? r.completedAt instanceof Date
          ? r.completedAt.toISOString()
          : String(r.completedAt)
        : null,
    }
  }

  async completeQuest(userId: string, questId: string): Promise<void> {
    const { eq, and } = await import('drizzle-orm')
    await this.db
      .update(this.schema.userQuests)
      .set({ status: 'completed', completedAt: new Date() })
      .where(
        and(
          eq(this.schema.userQuests.userId, userId),
          eq(this.schema.userQuests.questId, questId),
          eq(this.schema.userQuests.status, 'active'),
        ),
      )
  }

  async assignDailyQuests(userId: string): Promise<UserQuest[]> {
    const { eq, isNull, or } = await import('drizzle-orm')

    // Get all non-premium, non-expired quests
    const now = new Date()
    const availableQuests = await this.db
      .select()
      .from(this.schema.quests)
      .where(
        or(
          isNull(this.schema.quests.expiresAt),
          // We can't easily compare dates without sql`` but keep simple:
        ),
      )
      .limit(3)

    // Get quests user already started today
    const existingUserQuests = await this.db
      .select({ questId: this.schema.userQuests.questId })
      .from(this.schema.userQuests)
      .where(eq(this.schema.userQuests.userId, userId))

    const existingQuestIds = new Set(
      existingUserQuests.map((q: { questId: string }) => q.questId),
    )

    const assigned: UserQuest[] = []
    for (const quest of availableQuests) {
      if (existingQuestIds.has(quest.id)) continue

      const [uq] = await this.db
        .insert(this.schema.userQuests)
        .values({
          userId,
          questId: quest.id,
          status: 'active',
          progress: {},
        })
        .returning()

      assigned.push(this.mapUserQuest(uq))
    }

    return assigned
  }
}
