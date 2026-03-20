import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BadgeService } from '../services/BadgeService'
import { EventEmitter } from 'events'

describe('BadgeService', () => {
  let emitter: EventEmitter
  let badgeService: BadgeService
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDb: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSchema: any

  const userId = 'user-badge-test'

  const badges = [
    {
      id: 'badge-1',
      slug: 'first_lesson',
      name: 'Primeira Lição',
      description: 'Complete sua primeira lição',
      iconUrl: null,
      criteria: { type: 'lesson_count', threshold: 1 },
      isPremium: false,
    },
    {
      id: 'badge-2',
      slug: 'streak_7',
      name: 'Semana Dedicada',
      description: '7 dias seguidos',
      iconUrl: null,
      criteria: { type: 'streak_days', threshold: 7 },
      isPremium: false,
    },
    {
      id: 'badge-3',
      slug: 'level_5',
      name: 'Nível 5',
      description: 'Alcance o nível 5',
      iconUrl: null,
      criteria: { type: 'level_reached', threshold: 5 },
      isPremium: false,
    },
    {
      id: 'badge-4',
      slug: 'xp_1000',
      name: 'Mil XP',
      description: 'Ganhe 1000 XP total',
      iconUrl: null,
      criteria: { type: 'xp_total', threshold: 1000 },
      isPremium: false,
    },
  ]

  beforeEach(() => {
    emitter = new EventEmitter()
    mockSchema = {
      badges: { id: 'id', slug: 'slug', criteria: 'criteria', isPremium: 'isPremium' },
      userBadges: { id: 'id', userId: 'userId', badgeId: 'badgeId', earnedAt: 'earnedAt' },
    }
    mockDb = {
      select: vi.fn(),
      insert: vi.fn(),
    }
    badgeService = new BadgeService(mockDb, mockSchema, emitter)
  })

  describe('getUserBadges', () => {
    it('returns empty array when user has no badges', async () => {
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await badgeService.getUserBadges(userId)
      expect(result).toEqual([])
    })

    it('returns user badges with badge data', async () => {
      const now = new Date()
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{
              id: 'ub-1',
              userId,
              badgeId: 'badge-1',
              earnedAt: now,
              badge: badges[0],
            }]),
          }),
        }),
      })

      const result = await badgeService.getUserBadges(userId)
      expect(result).toHaveLength(1)
      expect(result[0]!.badge?.slug).toBe('first_lesson')
    })
  })

  describe('checkAndAward', () => {
    it('awards first_lesson badge when lesson_count criteria met', async () => {
      const now = new Date()

      // getAllBadges
      const selectMock = vi.fn()
      let callCount = 0

      mockDb.select = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call: get all badges
          return {
            from: vi.fn().mockResolvedValue(badges),
          }
        } else {
          // Second call: get existing user badges
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          }
        }
      })

      mockDb.insert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'ub-new',
            userId,
            badgeId: 'badge-1',
            earnedAt: now,
          }]),
        }),
      })

      const emitted = vi.fn()
      emitter.on('badge.earned', emitted)

      const earned = await badgeService.checkAndAward(userId, 'lesson_completed', {
        totalLessonsCompleted: 1,
        currentStreak: 0,
        longestStreak: 0,
        currentLevel: 1,
        totalXp: 50,
        totalQuestsCompleted: 0,
      })

      expect(earned.length).toBeGreaterThan(0)
      expect(earned[0]!.badge?.slug).toBe('first_lesson')
      expect(emitted).toHaveBeenCalled()
    })

    it('does not award badge if user already has it', async () => {
      let callCount = 0

      mockDb.select = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return { from: vi.fn().mockResolvedValue(badges) }
        } else {
          // User already has badge-1
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([{ badgeId: 'badge-1' }]),
            }),
          }
        }
      })

      const earned = await badgeService.checkAndAward(userId, 'lesson_completed', {
        totalLessonsCompleted: 5,
        currentStreak: 0,
        longestStreak: 0,
        currentLevel: 1,
        totalXp: 250,
        totalQuestsCompleted: 0,
      })

      // badge-1 already owned, so not re-awarded
      const firstLesson = earned.find(b => b.badge?.slug === 'first_lesson')
      expect(firstLesson).toBeUndefined()
    })

    it('awards streak badge when streak threshold met', async () => {
      const now = new Date()
      let callCount = 0

      mockDb.select = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return { from: vi.fn().mockResolvedValue([badges[1]]) } // only streak badge
        } else {
          return { from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }) }
        }
      })

      mockDb.insert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 'ub-2', userId, badgeId: 'badge-2', earnedAt: now }]),
        }),
      })

      const earned = await badgeService.checkAndAward(userId, 'streak.updated', {
        currentStreak: 7,
        longestStreak: 7,
        currentLevel: 1,
        totalXp: 70,
        totalLessonsCompleted: 7,
        totalQuestsCompleted: 0,
      })

      expect(earned.length).toBeGreaterThan(0)
    })

    it('returns empty array when no criteria met', async () => {
      let callCount = 0
      mockDb.select = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return { from: vi.fn().mockResolvedValue(badges) }
        } else {
          return { from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }) }
        }
      })

      const earned = await badgeService.checkAndAward(userId, 'lesson_completed', {
        totalLessonsCompleted: 0, // No lessons completed
        currentStreak: 0,
        longestStreak: 0,
        currentLevel: 1,
        totalXp: 0,
        totalQuestsCompleted: 0,
      })

      expect(earned).toEqual([])
    })
  })
})
