import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GamificationEngine } from '../GamificationEngine'

describe('GamificationEngine', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDb: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSchema: any
  let engine: GamificationEngine

  const userId = 'user-engine-test'
  const lessonId = 'lesson-engine-test'

  beforeEach(() => {
    mockSchema = {
      xpEvents: {},
      userLevels: {},
      streaks: {},
      badges: {},
      userBadges: {},
      quests: {},
      userQuests: {},
      userCoins: {},
      userProgress: {},
      users: {},
      avatars: {},
      institutionMembers: {},
    }

    // Default chainable mock db that returns safe empty arrays
    const chainMock = () => {
      const chain: Record<string, ReturnType<typeof vi.fn>> = {}
      const methods = ['select', 'insert', 'update', 'from', 'leftJoin', 'where', 'limit', 'offset', 'orderBy', 'groupBy', 'returning', 'values', 'set', 'onConflictDoUpdate', 'catch']
      for (const m of methods) {
        chain[m] = vi.fn().mockReturnThis()
      }
      // Terminal methods that return data
      chain['limit'] = vi.fn().mockResolvedValue([])
      chain['returning'] = vi.fn().mockResolvedValue([])
      chain['where'] = vi.fn().mockReturnValue({
        ...chain,
        limit: vi.fn().mockResolvedValue([]),
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      })
      return chain
    }

    // Helper: returns a chainable object that also resolves to [] when awaited
    const makeFromResult = () => {
      // .where() must return a Promise so `await from().where()` resolves to []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereResult: any = Object.assign(Promise.resolve([]), {
        limit: vi.fn().mockResolvedValue([]),
        orderBy: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([]) }),
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p: any = Object.assign(Promise.resolve([]), {
        where: vi.fn().mockReturnValue(whereResult),
        leftJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
          leftJoin: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }),
        }),
      })
      return p
    }

    mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockImplementation(() => makeFromResult()),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'evt-1',
            userId,
            sourceType: 'lesson_complete',
            sourceId: lessonId,
            xpAmount: 50,
            createdAt: new Date(),
          }]),
          catch: vi.fn().mockResolvedValue(undefined),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    }

    engine = new GamificationEngine(mockDb, mockSchema)
  })

  describe('constructor', () => {
    it('creates all services', () => {
      expect(engine.xp).toBeDefined()
      expect(engine.levels).toBeDefined()
      expect(engine.streaks).toBeDefined()
      expect(engine.badges).toBeDefined()
      expect(engine.quests).toBeDefined()
      expect(engine.leaderboard).toBeDefined()
    })
  })

  describe('onLessonComplete', () => {
    // Shared helper to create a thenable from() result
    const makeFromResult = (resolveWith: unknown[] = []) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereResult: any = Object.assign(Promise.resolve(resolveWith), {
        limit: vi.fn().mockResolvedValue([]),
        orderBy: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([]) }),
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p: any = Object.assign(Promise.resolve(resolveWith), {
        where: vi.fn().mockReturnValue(whereResult),
        leftJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      })
      return p
    }

    it('returns expected shape on first completion', async () => {
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockImplementation(() => makeFromResult()),
      })

      mockDb.insert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'evt-1',
            userId,
            sourceType: 'lesson_complete',
            sourceId: lessonId,
            xpAmount: 125, // 50 base + 75 first time
            createdAt: new Date(),
          }]),
          catch: vi.fn().mockResolvedValue(undefined),
        }),
      })

      const result = await engine.onLessonComplete(userId, lessonId, undefined, true)

      expect(result).toMatchObject({
        xpAwarded: expect.any(Number),
        leveledUp: expect.any(Boolean),
        newLevel: expect.any(Number),
        badgesEarned: expect.any(Array),
        questsCompleted: expect.any(Array),
        streakUpdated: expect.objectContaining({
          userId,
          currentStreak: expect.any(Number),
        }),
      })
    })

    it('awards bonus XP for perfect quiz score', async () => {
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockImplementation(() => makeFromResult()),
      })

      let xpInserted = 0
      let firstXpCaptured = false
      mockDb.insert = vi.fn().mockImplementation(() => {
        return {
          values: vi.fn().mockImplementation((vals: { xpAmount?: number; sourceType?: string }) => {
            // Only capture the first XP event insert (lesson_complete)
            if (vals.xpAmount !== undefined && !firstXpCaptured) {
              xpInserted = vals.xpAmount
              firstXpCaptured = true
            }
            return {
              returning: vi.fn().mockResolvedValue([{
                id: 'evt-1', userId, sourceType: vals.sourceType ?? 'lesson_complete', sourceId: lessonId,
                xpAmount: vals.xpAmount ?? 0, createdAt: new Date(),
              }]),
              catch: vi.fn().mockResolvedValue(undefined),
            }
          }),
        }
      })

      await engine.onLessonComplete(userId, lessonId, 100, false)
      // 50 base + 25 quiz perfect = 75
      expect(xpInserted).toBe(75)
    })

    it('collects badges earned during completion', async () => {
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockImplementation(() => makeFromResult()),
      })

      mockDb.insert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'evt-1', userId, sourceType: 'lesson_complete', sourceId: lessonId,
            xpAmount: 50, createdAt: new Date(),
          }]),
          catch: vi.fn().mockResolvedValue(undefined),
        }),
      })

      const result = await engine.onLessonComplete(userId, lessonId)
      expect(Array.isArray(result.badgesEarned)).toBe(true)
    })
  })

  describe('getProfile', () => {
    it('returns full gamification profile', async () => {
      const now = new Date()
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              userId,
              currentXp: 150,
              level: 2,
              updatedAt: now,
            }]),
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
            leftJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      })

      const profile = await engine.getProfile(userId)

      expect(profile).toMatchObject({
        userId,
        level: expect.objectContaining({ level: expect.any(Number) }),
        streak: expect.objectContaining({ userId }),
        badges: expect.any(Array),
        activeQuests: expect.any(Array),
        coins: expect.objectContaining({ userId }),
        recentXpEvents: expect.any(Array),
      })
    })
  })
})
