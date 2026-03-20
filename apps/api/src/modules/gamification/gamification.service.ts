// gamification.service.ts — bridge between API routes and GamificationEngine
import { GamificationEngine } from '@repo/gamification'
import { eq } from 'drizzle-orm'
import type { Database } from '../../db/index'
import * as schema from '../../db/schema'
import { notificationsService } from '../notifications/notifications.service'

export class GamificationService {
  private engine: GamificationEngine

  constructor(private readonly db: Database) {
    this.engine = new GamificationEngine(db, schema)
  }

  async getProfile(userId: string) {
    return this.engine.getProfile(userId)
  }

  async getLeaderboard(type: 'weekly' | 'all_time', page = 1) {
    if (type === 'weekly') {
      return this.engine.leaderboard.getWeekly(page)
    }
    return this.engine.leaderboard.getGlobal(page)
  }

  async getUserRank(userId: string) {
    const rank = await this.engine.leaderboard.getUserRank(userId)
    return { rank }
  }

  async getActiveQuests(userId: string) {
    return this.engine.quests.getActiveQuests(userId)
  }

  async startQuest(userId: string, questId: string) {
    return this.engine.quests.startQuest(userId, questId)
  }

  async getUserBadges(userId: string) {
    return this.engine.badges.getUserBadges(userId)
  }

  async completeLessonProgress(
    userId: string,
    lessonId: string,
    score?: number,
    timeSpentSeconds?: number,
  ) {
    // Check if this user has already completed this lesson
    const existingProgress = await this.db
      .select()
      .from(schema.userProgress)
      .where(eq(schema.userProgress.userId, userId))
      .limit(100)

    const lessonRecord = existingProgress.find(
      (p) => p.lessonId === lessonId && p.completedAt !== null,
    )
    const isFirstTime = !lessonRecord

    // Upsert user progress record
    const progressExists = existingProgress.find((p) => p.lessonId === lessonId)

    if (!progressExists) {
      await this.db.insert(schema.userProgress).values({
        userId,
        lessonId,
        completedAt: new Date(),
        score: score ?? null,
        attempts: 1,
        timeSpentSeconds: timeSpentSeconds ?? 0,
      })
    } else {
      await this.db
        .update(schema.userProgress)
        .set({
          attempts: progressExists.attempts + 1,
          completedAt: new Date(),
          score: score ?? progressExists.score,
        })
        .where(eq(schema.userProgress.id, progressExists.id))
    }

    const result = await this.engine.onLessonComplete(userId, lessonId, score, isFirstTime)

    // Emit notifications based on result
    if (result.leveledUp) {
      notificationsService.create(userId, 'level_up', { new_level: result.newLevel }).catch(console.error)
    }

    for (const badge of result.badgesEarned) {
      notificationsService.create(userId, 'badge_earned', { badge_name: badge.name, badge_id: badge.id }).catch(console.error)
    }

    for (const quest of result.questsCompleted) {
      notificationsService.create(userId, 'quest_completed', { quest_title: quest.title, quest_id: quest.id }).catch(console.error)
    }

    return result
  }
}
