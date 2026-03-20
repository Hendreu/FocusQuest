import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LEVEL_TABLE } from '../constants/levels'
import { LevelService } from '../services/LevelService'
import { EventEmitter } from 'events'

describe('LevelService', () => {
  let emitter: EventEmitter
  let levelService: LevelService
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDb: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSchema: any

  beforeEach(() => {
    emitter = new EventEmitter()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockDb = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
    }
    mockSchema = {
      userLevels: { userId: 'userId', currentXp: 'currentXp', level: 'level', updatedAt: 'updatedAt' },
    }
    levelService = new LevelService(mockDb, mockSchema, emitter)
  })

  describe('LEVEL_TABLE', () => {
    it('has 50 levels', () => {
      expect(LEVEL_TABLE).toHaveLength(50)
    })

    it('level 1 requires 0 XP with xpToNext 100', () => {
      expect(LEVEL_TABLE[0]).toMatchObject({ level: 1, xpRequired: 0, xpToNext: 100, title: 'Iniciante' })
    })

    it('level 2 requires 100 XP with xpToNext 200', () => {
      expect(LEVEL_TABLE[1]).toMatchObject({ level: 2, xpRequired: 100, xpToNext: 200, title: 'Aprendiz' })
    })

    it('level 3 requires 300 XP', () => {
      // xpRequired(3) = 100 * 2 * 3 / 2 = 300
      expect(LEVEL_TABLE[2]!.xpRequired).toBe(300)
    })

    it('level 50 has xpToNext 0', () => {
      expect(LEVEL_TABLE[49]!.xpToNext).toBe(0)
    })

    it('xpRequired is monotonically increasing', () => {
      for (let i = 1; i < LEVEL_TABLE.length; i++) {
        expect(LEVEL_TABLE[i]!.xpRequired).toBeGreaterThan(LEVEL_TABLE[i - 1]!.xpRequired)
      }
    })
  })

  describe('getLevelForXP', () => {
    it('returns level 1 for 0 XP', () => {
      expect(levelService.getLevelForXP(0).level).toBe(1)
    })

    it('returns level 1 for 99 XP', () => {
      expect(levelService.getLevelForXP(99).level).toBe(1)
    })

    it('returns level 2 for exactly 100 XP', () => {
      expect(levelService.getLevelForXP(100).level).toBe(2)
    })

    it('returns level 2 for 299 XP', () => {
      expect(levelService.getLevelForXP(299).level).toBe(2)
    })

    it('returns level 3 for exactly 300 XP', () => {
      expect(levelService.getLevelForXP(300).level).toBe(3)
    })

    it('returns level 50 for very large XP', () => {
      expect(levelService.getLevelForXP(999999).level).toBe(50)
    })

    it('never returns level lower than 1', () => {
      expect(levelService.getLevelForXP(-100).level).toBeGreaterThanOrEqual(1)
    })
  })

  describe('addXP', () => {
    it('creates user_levels row if not exists and awards XP', async () => {
      const returning = [{ userId: 'u1', currentXp: 50, level: 1, updatedAt: new Date() }]
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
      mockDb.update = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })

      const result = await levelService.addXP('u1', 50)
      expect(result.currentXp).toBe(50)
      expect(result.leveledUp).toBe(false)
      expect(result.newLevel).toBe(1)
    })

    it('detects level-up when XP crosses threshold', async () => {
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ userId: 'u1', currentXp: 50, level: 1, updatedAt: new Date() }]),
          }),
        }),
      })
      mockDb.update = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })

      const emitted = vi.fn()
      emitter.on('level.up', emitted)

      // Adding 60 XP brings us to 110, which crosses 100 XP threshold for level 2
      const result = await levelService.addXP('u1', 60)
      expect(result.leveledUp).toBe(true)
      expect(result.newLevel).toBe(2)
      expect(emitted).toHaveBeenCalledWith({ userId: 'u1', oldLevel: 1, newLevel: 2 })
    })

    it('does not emit level.up if no level change', async () => {
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ userId: 'u1', currentXp: 0, level: 1, updatedAt: new Date() }]),
          }),
        }),
      })
      mockDb.update = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })

      const emitted = vi.fn()
      emitter.on('level.up', emitted)

      await levelService.addXP('u1', 10)
      expect(emitted).not.toHaveBeenCalled()
    })
  })

  describe('getProfile', () => {
    it('returns default profile if user has no levels row', async () => {
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const profile = await levelService.getProfile('u1')
      expect(profile).toMatchObject({ userId: 'u1', currentXp: 0, level: 1 })
    })

    it('returns existing profile data', async () => {
      const now = new Date()
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ userId: 'u1', currentXp: 350, level: 3, updatedAt: now }]),
          }),
        }),
      })

      const profile = await levelService.getProfile('u1')
      expect(profile).toMatchObject({ userId: 'u1', currentXp: 350, level: 3 })
    })
  })
})
