// StreakService.ts — track daily activity streaks with freeze support
import { EventEmitter } from 'events'
import type { Streak } from '@repo/types'

function toDateString(d: Date): string {
  // Always produce a UTC date string so stored dates are timezone-agnostic
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function daysDiff(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000
  const utcA = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate())
  const utcB = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate())
  return Math.round((utcB - utcA) / msPerDay)
}

export class StreakService {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly db: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly schema: any,
    private readonly emitter: EventEmitter,
  ) {}

  isStreakBroken(lastActivityDate: Date, currentDate?: Date): boolean {
    const now = currentDate ?? new Date()
    const diff = daysDiff(lastActivityDate, now)
    return diff > 1
  }

  async getStreak(userId: string): Promise<Streak> {
    const { eq } = await import('drizzle-orm')
    const rows = await this.db
      .select()
      .from(this.schema.streaks)
      .where(eq(this.schema.streaks.userId, userId))
      .limit(1)

    if (rows.length === 0) {
      return {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakFreezes: 0,
      }
    }

    const r = rows[0]
    return {
      userId: r.userId,
      currentStreak: r.currentStreak,
      longestStreak: r.longestStreak,
      lastActivityDate: r.lastActivityDate ?? null,
      streakFreezes: r.streakFreezes,
    }
  }

  async recordActivity(userId: string, date?: Date): Promise<Streak> {
    const { eq } = await import('drizzle-orm')
    const today = date ?? new Date()
    const todayStr = toDateString(today)

    const existing = await this.db
      .select()
      .from(this.schema.streaks)
      .where(eq(this.schema.streaks.userId, userId))
      .limit(1)

    if (existing.length === 0) {
      // First activity ever
      await this.db.insert(this.schema.streaks).values({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: todayStr,
        streakFreezes: 0,
      })

      const streak: Streak = {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: todayStr,
        streakFreezes: 0,
      }
      this.emitter.emit('streak.updated', streak)
      return streak
    }

    const row = existing[0]
    const lastDate = row.lastActivityDate
      ? new Date(row.lastActivityDate)
      : null

    // Already recorded today — no change
    if (lastDate && toDateString(lastDate) === todayStr) {
      return {
        userId: row.userId,
        currentStreak: row.currentStreak,
        longestStreak: row.longestStreak,
        lastActivityDate: row.lastActivityDate,
        streakFreezes: row.streakFreezes,
      }
    }

    let newStreak = row.currentStreak
    let freezesLeft = row.streakFreezes

    if (!lastDate) {
      // No previous activity, start fresh
      newStreak = 1
    } else {
      const diff = daysDiff(lastDate, today)
      if (diff === 1) {
        // Consecutive day — increment streak
        newStreak = row.currentStreak + 1
      } else if (diff > 1) {
        // Gap detected
        if (freezesLeft > 0) {
          // Use one freeze to preserve streak
          freezesLeft -= 1
          newStreak = row.currentStreak + 1
        } else {
          // Streak broken — reset to 1
          newStreak = 1
        }
      }
    }

    const newLongest = Math.max(row.longestStreak, newStreak)

    await this.db
      .update(this.schema.streaks)
      .set({
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActivityDate: todayStr,
        streakFreezes: freezesLeft,
      })
      .where(eq(this.schema.streaks.userId, userId))

    const streak: Streak = {
      userId,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActivityDate: todayStr,
      streakFreezes: freezesLeft,
    }

    this.emitter.emit('streak.updated', { userId, currentStreak: newStreak })
    return streak
  }

  async addStreakFreeze(userId: string): Promise<void> {
    const { eq } = await import('drizzle-orm')
    const rows = await this.db
      .select()
      .from(this.schema.streaks)
      .where(eq(this.schema.streaks.userId, userId))
      .limit(1)

    if (rows.length === 0) {
      await this.db.insert(this.schema.streaks).values({
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakFreezes: 1,
      })
    } else {
      const row = rows[0]
      await this.db
        .update(this.schema.streaks)
        .set({ streakFreezes: row.streakFreezes + 1 })
        .where(eq(this.schema.streaks.userId, userId))
    }
  }
}
