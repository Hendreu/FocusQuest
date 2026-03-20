import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StreakService } from '../services/StreakService'
import { EventEmitter } from 'events'

describe('StreakService', () => {
  let emitter: EventEmitter
  let streakService: StreakService
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDb: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSchema: any

  const userId = 'user-abc'

  function makeDate(daysAgo: number): Date {
    const d = new Date()
    d.setDate(d.getDate() - daysAgo)
    return d
  }

  beforeEach(() => {
    emitter = new EventEmitter()
    mockSchema = {
      streaks: {
        userId: 'userId', currentStreak: 'currentStreak', longestStreak: 'longestStreak',
        lastActivityDate: 'lastActivityDate', streakFreezes: 'streakFreezes',
      },
    }
    mockDb = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
    }
    streakService = new StreakService(mockDb, mockSchema, emitter)
  })

  describe('isStreakBroken', () => {
    it('returns false when last activity was yesterday', () => {
      const yesterday = makeDate(1)
      expect(streakService.isStreakBroken(yesterday)).toBe(false)
    })

    it('returns false when last activity was today', () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      expect(streakService.isStreakBroken(today)).toBe(false)
    })

    it('returns true when last activity was 2 days ago', () => {
      const twoDaysAgo = makeDate(2)
      expect(streakService.isStreakBroken(twoDaysAgo)).toBe(true)
    })

    it('returns true when last activity was 10 days ago', () => {
      const tenDaysAgo = makeDate(10)
      expect(streakService.isStreakBroken(tenDaysAgo)).toBe(true)
    })
  })

  describe('getStreak', () => {
    it('returns default streak if user has no record', async () => {
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const streak = await streakService.getStreak(userId)
      expect(streak).toMatchObject({
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakFreezes: 0,
      })
    })

    it('returns existing streak data', async () => {
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              userId, currentStreak: 5, longestStreak: 10,
              lastActivityDate: '2026-03-18', streakFreezes: 2,
            }]),
          }),
        }),
      })

      const streak = await streakService.getStreak(userId)
      expect(streak.currentStreak).toBe(5)
      expect(streak.longestStreak).toBe(10)
    })
  })

  describe('recordActivity', () => {
    it('creates initial streak on first activity', async () => {
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })
      mockDb.insert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      })

      const streak = await streakService.recordActivity(userId)
      expect(streak.currentStreak).toBe(1)
      expect(streak.longestStreak).toBe(1)
    })

    it('increments streak on consecutive day', async () => {
      const yesterday = makeDate(1)
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              userId, currentStreak: 3, longestStreak: 5,
              lastActivityDate: yesterday.toISOString().slice(0, 10), streakFreezes: 0,
            }]),
          }),
        }),
      })
      mockDb.update = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })

      const streak = await streakService.recordActivity(userId)
      expect(streak.currentStreak).toBe(4)
    })

    it('resets streak when broken with no freezes', async () => {
      const twoDaysAgo = makeDate(2)
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              userId, currentStreak: 10, longestStreak: 10,
              lastActivityDate: twoDaysAgo.toISOString().slice(0, 10), streakFreezes: 0,
            }]),
          }),
        }),
      })
      mockDb.update = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })

      const streak = await streakService.recordActivity(userId)
      expect(streak.currentStreak).toBe(1)
    })

    it('uses streak freeze when streak would break', async () => {
      const twoDaysAgo = makeDate(2)
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              userId, currentStreak: 7, longestStreak: 7,
              lastActivityDate: twoDaysAgo.toISOString().slice(0, 10), streakFreezes: 1,
            }]),
          }),
        }),
      })
      mockDb.update = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })

      const streak = await streakService.recordActivity(userId)
      expect(streak.currentStreak).toBe(8) // preserved + incremented
      expect(streak.streakFreezes).toBe(0) // freeze consumed
    })

    it('does not change streak if activity already recorded today', async () => {
      const today = new Date().toISOString().slice(0, 10)
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              userId, currentStreak: 3, longestStreak: 3,
              lastActivityDate: today, streakFreezes: 0,
            }]),
          }),
        }),
      })

      const streak = await streakService.recordActivity(userId)
      expect(streak.currentStreak).toBe(3) // unchanged
    })

    it('emits streak.updated event', async () => {
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })
      mockDb.insert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      })

      const emitted = vi.fn()
      emitter.on('streak.updated', emitted)
      await streakService.recordActivity(userId)
      expect(emitted).toHaveBeenCalled()
    })

    it('updates longestStreak when current exceeds it', async () => {
      const yesterday = makeDate(1)
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              userId, currentStreak: 5, longestStreak: 5,
              lastActivityDate: yesterday.toISOString().slice(0, 10), streakFreezes: 0,
            }]),
          }),
        }),
      })
      mockDb.update = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })

      const streak = await streakService.recordActivity(userId)
      expect(streak.longestStreak).toBe(6)
    })
  })

  describe('addStreakFreeze', () => {
    it('inserts a new streak row with 1 freeze if user has none', async () => {
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })
      mockDb.insert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      })

      await streakService.addStreakFreeze(userId)
      expect(mockDb.insert).toHaveBeenCalled()
    })

    it('increments freezes for existing user', async () => {
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ userId, currentStreak: 3, longestStreak: 3, lastActivityDate: '2026-03-18', streakFreezes: 1 }]),
          }),
        }),
      })
      mockDb.update = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })

      await streakService.addStreakFreeze(userId)
      const updateArgs = mockDb.update.mock.calls[0]
      expect(mockDb.update).toHaveBeenCalled()
    })
  })
})
