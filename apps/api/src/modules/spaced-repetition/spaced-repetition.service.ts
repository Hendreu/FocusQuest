import { db } from '../../db/index'
import { spacedRepetitionItems } from '../../db/schema'
import { eq, and, lte } from 'drizzle-orm'
import { calculateSM2 } from './sm2'

export class SpacedRepetitionService {
  /**
   * Get all items due for review for a user (next_review_at <= now)
   */
  async getDueItems(userId: string) {
    const now = new Date()
    return db
      .select()
      .from(spacedRepetitionItems)
      .where(
        and(
          eq(spacedRepetitionItems.userId, userId),
          lte(spacedRepetitionItems.nextReviewAt, now),
        ),
      )
  }

  /**
   * Upsert a spaced repetition item after a wrong quiz answer.
   * Creates a new item with next_review_at = tomorrow if not already tracked.
   */
  async upsertAfterWrong(userId: string, lessonId: string, questionId: string) {
    const existing = await db
      .select()
      .from(spacedRepetitionItems)
      .where(
        and(
          eq(spacedRepetitionItems.userId, userId),
          eq(spacedRepetitionItems.lessonId, lessonId),
          eq(spacedRepetitionItems.questionId, questionId),
        ),
      )
      .limit(1)

    if (existing.length === 0) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      await db.insert(spacedRepetitionItems).values({
        userId,
        lessonId,
        questionId,
        nextReviewAt: tomorrow,
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
      })
    }
    // If already tracked, leave it — will be reviewed when due
  }

  /**
   * Record a review result and calculate next review schedule using SM-2.
   */
  async recordReview(userId: string, itemId: string, quality: number) {
    const [item] = await db
      .select()
      .from(spacedRepetitionItems)
      .where(
        and(
          eq(spacedRepetitionItems.id, itemId),
          eq(spacedRepetitionItems.userId, userId),
        ),
      )
      .limit(1)

    if (!item) throw new Error('Spaced repetition item not found')

    const result = calculateSM2({
      easeFactor: item.easeFactor,
      interval: item.interval,
      repetitions: item.repetitions,
      quality,
    })

    await db
      .update(spacedRepetitionItems)
      .set({
        easeFactor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
        nextReviewAt: result.nextReviewAt,
      })
      .where(eq(spacedRepetitionItems.id, itemId))

    return result
  }
}

export const spacedRepetitionService = new SpacedRepetitionService()
