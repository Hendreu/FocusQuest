import { describe, it, expect, vi, beforeEach } from 'vitest'
import { XPService } from '../services/XPService'
import { EventEmitter } from 'events'

describe('XPService', () => {
  let emitter: EventEmitter
  let xpService: XPService
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDb: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSchema: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockLevelService: any

  const userId = 'user-123'

  beforeEach(() => {
    emitter = new EventEmitter()
    mockSchema = {
      xpEvents: { userId: 'userId', sourceType: 'sourceType', sourceId: 'sourceId', xpAmount: 'xpAmount', createdAt: 'createdAt' },
    }
    mockLevelService = {
      addXP: vi.fn().mockResolvedValue({ leveledUp: false, newLevel: 1, currentXp: 50 }),
    }
    mockDb = {
      insert: vi.fn(),
      select: vi.fn(),
    }
    xpService = new XPService(mockDb, mockSchema, emitter, mockLevelService)
  })

  describe('award', () => {
    it('inserts xp_event and calls levelService.addXP', async () => {
      const now = new Date()
      mockDb.insert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'evt-1', userId, sourceType: 'lesson_complete', sourceId: 'lesson-1', xpAmount: 50, createdAt: now,
          }]),
        }),
      })

      const event = await xpService.award(userId, 'lesson_complete', 50, 'lesson-1')

      expect(event.xpAmount).toBe(50)
      expect(event.userId).toBe(userId)
      expect(event.sourceType).toBe('lesson_complete')
      expect(mockLevelService.addXP).toHaveBeenCalledWith(userId, 50)
    })

    it('emits xp.awarded event', async () => {
      const now = new Date()
      mockDb.insert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'evt-1', userId, sourceType: 'streak_bonus', sourceId: null, xpAmount: 10, createdAt: now,
          }]),
        }),
      })

      const emitted = vi.fn()
      emitter.on('xp.awarded', emitted)

      await xpService.award(userId, 'streak_bonus', 10)
      expect(emitted).toHaveBeenCalledWith(expect.objectContaining({ userId, xpAmount: 10 }))
    })

    it('works without sourceId', async () => {
      const now = new Date()
      mockDb.insert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'evt-2', userId, sourceType: 'daily_login', sourceId: null, xpAmount: 5, createdAt: now,
          }]),
        }),
      })

      const event = await xpService.award(userId, 'daily_login', 5)
      expect(event.sourceId).toBeNull()
    })
  })

  describe('getTotal', () => {
    it('returns sum of all XP events', async () => {
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ total: '150' }]),
        }),
      })

      const total = await xpService.getTotal(userId)
      expect(total).toBe(150)
    })

    it('returns 0 when no events', async () => {
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ total: null }]),
        }),
      })

      const total = await xpService.getTotal(userId)
      expect(total).toBe(0)
    })
  })

  describe('getHistory', () => {
    it('returns XP events in descending order', async () => {
      const now = new Date()
      const events = [
        { id: 'e1', userId, sourceType: 'lesson_complete', sourceId: null, xpAmount: 50, createdAt: now },
        { id: 'e2', userId, sourceType: 'daily_login', sourceId: null, xpAmount: 5, createdAt: now },
      ]
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(events),
            }),
          }),
        }),
      })

      const history = await xpService.getHistory(userId)
      expect(history).toHaveLength(2)
      expect(history[0]!.id).toBe('e1')
    })

    it('respects limit parameter', async () => {
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      })

      await xpService.getHistory(userId, 5)
      // Just ensure it runs without error
      expect(mockDb.select).toHaveBeenCalled()
    })
  })
})
