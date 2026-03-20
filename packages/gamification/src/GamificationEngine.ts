// GamificationEngine.ts — Facade with EventEmitter cascade
import { EventEmitter } from 'events'
import { XPService } from './services/XPService'
import { LevelService } from './services/LevelService'
import { StreakService } from './services/StreakService'
import { BadgeService } from './services/BadgeService'
import { QuestService } from './services/QuestService'
import { LeaderboardService } from './services/LeaderboardService'
import { XP_REWARDS } from './constants/xp-rewards'
import type { GamificationProfile, Badge, Streak, Quest } from '@repo/types'
import type { UserQuest } from '@repo/types'

export interface LessonCompleteResult {
  xpAwarded: number
  leveledUp: boolean
  newLevel: number
  badgesEarned: Badge[]
  questsCompleted: Quest[]
  streakUpdated: Streak
}

export class GamificationEngine {
  readonly xp: XPService
  readonly levels: LevelService
  readonly streaks: StreakService
  readonly badges: BadgeService
  readonly quests: QuestService
  readonly leaderboard: LeaderboardService

  private readonly emitter: EventEmitter

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private readonly db: any, private readonly schema: any) {
    this.emitter = new EventEmitter()

    this.levels = new LevelService(db, schema, this.emitter)
    this.xp = new XPService(db, schema, this.emitter, this.levels)
    this.streaks = new StreakService(db, schema, this.emitter)
    this.badges = new BadgeService(db, schema, this.emitter)
    this.quests = new QuestService(db, schema, this.emitter)
    this.leaderboard = new LeaderboardService(db, schema)

    this.setupCascadeListeners()
  }

  private setupCascadeListeners(): void {
    // When XP is awarded → check badge criteria
    this.emitter.on(
      'xp.awarded',
      async ({
        userId,
        newTotal,
        leveledUp,
        newLevel,
      }: {
        userId: string
        xpAmount: number
        newTotal: number
        leveledUp: boolean
        newLevel: number
      }) => {
        try {
          // Update quest progress for xp-based quests
          await this.quests.updateProgress(userId, 'xp.awarded', {
            xp_earned: newTotal,
          })
        } catch {
          // non-blocking
        }
      },
    )

    // When level-up → check level-based badges
    this.emitter.on(
      'level.up',
      async ({
        userId,
        newLevel,
      }: {
        userId: string
        oldLevel: number
        newLevel: number
      }) => {
        try {
          const levelProfile = await this.levels.getProfile(userId)
          const xpTotal = await this.xp.getTotal(userId)
          await this.badges.checkAndAward(userId, 'level.up', {
            currentLevel: newLevel,
            totalXp: xpTotal,
            currentStreak: 0,
            longestStreak: 0,
            totalLessonsCompleted: 0,
            totalQuestsCompleted: 0,
          })
        } catch {
          // non-blocking
        }
      },
    )

    // When streak is updated → check streak badges + update streak quests
    this.emitter.on(
      'streak.updated',
      async ({
        userId,
        currentStreak,
      }: {
        userId: string
        currentStreak: number
      }) => {
        try {
          const streakData = await this.streaks.getStreak(userId)
          const xpTotal = await this.xp.getTotal(userId)
          const levelProfile = await this.levels.getProfile(userId)

          await this.badges.checkAndAward(userId, 'streak.updated', {
            currentStreak,
            longestStreak: streakData.longestStreak,
            currentLevel: levelProfile.level,
            totalXp: xpTotal,
            totalLessonsCompleted: 0,
            totalQuestsCompleted: 0,
          })

          await this.quests.updateProgress(userId, 'streak.updated', {
            streak_days: currentStreak,
          })
        } catch {
          // non-blocking
        }
      },
    )

    // When quest completes → check quest-count badges
    this.emitter.on(
      'quest.completed',
      async ({ userId }: { userId: string; quest: Quest }) => {
        try {
          const xpTotal = await this.xp.getTotal(userId)
          const levelProfile = await this.levels.getProfile(userId)
          const streakData = await this.streaks.getStreak(userId)
          await this.badges.checkAndAward(userId, 'quest.completed', {
            totalQuestsCompleted: 1, // approximate
            totalXp: xpTotal,
            currentLevel: levelProfile.level,
            currentStreak: streakData.currentStreak,
            longestStreak: streakData.longestStreak,
            totalLessonsCompleted: 0,
          })
        } catch {
          // non-blocking
        }
      },
    )
  }

  async onLessonComplete(
    userId: string,
    lessonId: string,
    score?: number,
    isFirstTime = true,
  ): Promise<LessonCompleteResult> {
    const badgesEarned: Badge[] = []
    const questsCompleted: Quest[] = []

    // Collect badge events during this call
    const badgeHandler = ({ badge }: { userId: string; badge: Badge }) => {
      badgesEarned.push(badge)
    }
    const questHandler = ({ quest }: { userId: string; quest: Quest }) => {
      questsCompleted.push(quest)
    }
    this.emitter.on('badge.earned', badgeHandler)
    this.emitter.on('quest.completed', questHandler)

    try {
      // 1. Award base XP
      let baseXp = XP_REWARDS.LESSON_COMPLETE
      if (isFirstTime) {
        baseXp += XP_REWARDS.LESSON_FIRST_TIME
      }
      if (score !== undefined && score >= 100) {
        baseXp += XP_REWARDS.QUIZ_PERFECT
      }

      const xpEvent = await this.xp.award(
        userId,
        'lesson_complete',
        baseXp,
        lessonId,
      )

      // 2. Update streak
      const streakUpdated = await this.streaks.recordActivity(userId)

      // 3. Award streak bonus XP if milestone
      if (streakUpdated.currentStreak >= 30) {
        await this.xp.award(userId, 'streak_bonus', XP_REWARDS.STREAK_MILESTONE_30)
      } else if (streakUpdated.currentStreak >= 7) {
        await this.xp.award(userId, 'streak_bonus', XP_REWARDS.STREAK_MILESTONE_7)
      } else if (streakUpdated.currentStreak >= 1) {
        await this.xp.award(userId, 'streak_bonus', XP_REWARDS.STREAK_DAY)
      }

      // 4. Update quest progress for lesson-based quests
      await this.quests.updateProgress(userId, 'lesson_completed', {
        lessons_completed: 1,
        quizzes_completed: score !== undefined ? 1 : 0,
      })

      // 5. Check lesson-count badges
      const { eq } = await import('drizzle-orm')
      const progressCount = await this.db
        .select({ count: (await import('drizzle-orm')).sql<number>`count(*)::int` })
        .from(this.schema.userProgress)
        .where(eq(this.schema.userProgress.userId, userId))

      const totalLessons = progressCount[0]?.count ?? 0
      const levelProfile = await this.levels.getProfile(userId)
      const xpTotal = await this.xp.getTotal(userId)

      await this.badges.checkAndAward(userId, 'lesson_completed', {
        totalLessonsCompleted: totalLessons,
        currentLevel: levelProfile.level,
        totalXp: xpTotal,
        currentStreak: streakUpdated.currentStreak,
        longestStreak: streakUpdated.longestStreak,
        totalQuestsCompleted: 0,
      })

      const levelProfile2 = await this.levels.getProfile(userId)

      return {
        xpAwarded: xpEvent.xpAmount,
        leveledUp: levelProfile2.level > levelProfile.level,
        newLevel: levelProfile2.level,
        badgesEarned,
        questsCompleted,
        streakUpdated,
      }
    } finally {
      this.emitter.off('badge.earned', badgeHandler)
      this.emitter.off('quest.completed', questHandler)
    }
  }

  async getProfile(userId: string): Promise<GamificationProfile> {
    const [levelProfile, streakData, userBadges, activeQuests, xpHistory] =
      await Promise.all([
        this.levels.getProfile(userId),
        this.streaks.getStreak(userId),
        this.badges.getUserBadges(userId),
        this.quests.getActiveQuests(userId),
        this.xp.getHistory(userId, 10),
      ])

    const rank = await this.leaderboard.getUserRank(userId)

    // Get coins
    const { eq } = await import('drizzle-orm')
    const coinsRows = await this.db
      .select()
      .from(this.schema.userCoins)
      .where(eq(this.schema.userCoins.userId, userId))
      .limit(1)

    const coins = coinsRows[0]
      ? {
          userId: coinsRows[0].userId,
          balance: coinsRows[0].balance,
          updatedAt: coinsRows[0].updatedAt.toISOString(),
        }
      : { userId, balance: 0, updatedAt: new Date().toISOString() }

    return {
      userId,
      level: levelProfile,
      streak: streakData,
      badges: userBadges,
      activeQuests,
      coins,
      recentXpEvents: xpHistory,
      leaderboardPosition: rank,
    }
  }
}
