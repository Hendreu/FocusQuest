import { eq, and, gt, lt } from 'drizzle-orm'
import { db } from '../db/index'
import { streaks } from '../db/schema'
import { notificationsService } from '../modules/notifications/notifications.service'

export async function runStreakReminder(): Promise<void> {
  const now = new Date()
  
  // Only run if it's around 19:00 (7 PM).
  if (now.getHours() !== 19) {
    return
  }

  // Get start of today to find users who haven't been active today
  const startOfTodayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  try {
    const profiles = await db.select()
      .from(streaks)
      .where(
        and(
          gt(streaks.currentStreak, 0),
          lt(streaks.lastActivityDate, startOfTodayStr)
        )
      )

    for (const profile of profiles) {
      await notificationsService.create(profile.userId, 'streak_reminder', {
        current_streak: profile.currentStreak,
        last_activity_date: profile.lastActivityDate
      })
    }
  } catch (err) {
    console.error('Failed to run streak reminder job', err)
  }
}
