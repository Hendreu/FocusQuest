import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QuestService } from '../services/QuestService'
import { EventEmitter } from 'events'

describe('QuestService', () => {
  let emitter: EventEmitter
  let questService: QuestService
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDb: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSchema: any

  const userId = 'user-quest-test'

  const mockQuest = {
    id: 'quest-1',
    slug: 'complete_5_lessons',
    title: 'Complete 5 Lições',
    description: 'Complete 5 lições para ganhar XP extra',
    xpReward: 100,
    coinReward: 10,
    criteria: { type: 'complete_lessons', target: 5 },
    expiresAt: null,
    isPremium: false,
  }

  const makeUserQuest = (override = {}) => ({
    id: 'uq-1',
    userId,
    questId: 'quest-1',
    status: 'active' as const,
    progress: {},
    startedAt: new Date(),
    completedAt: null,
    ...override,
  })

  beforeEach(() => {
    emitter = new EventEmitter()
    mockSchema = {
      userQuests: {
        id: 'id', userId: 'userId', questId: 'questId', status: 'status',
        progress: 'progress', startedAt: 'startedAt', completedAt: 'completedAt',
      },
      quests: {
        id: 'id', slug: 'slug', title: 'title', description: 'description',
        xpReward: 'xpReward', coinReward: 'coinReward', criteria: 'criteria',
        expiresAt: 'expiresAt', isPremium: 'isPremium',
      },
      xpEvents: {},
      userCoins: {},
    }
    mockDb = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
    }
    questService = new QuestService(mockDb, mockSchema, emitter)
  })

  describe('startQuest', () => {
    it('creates a new user quest', async () => {
      const uq = makeUserQuest()
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // not already started
          }),
        }),
      })
      mockDb.insert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([uq]),
        }),
      })

      const result = await questService.startQuest(userId, 'quest-1')
      expect(result.questId).toBe('quest-1')
      expect(result.status).toBe('active')
    })

    it('returns existing quest if already active', async () => {
      const uq = makeUserQuest()
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([uq]),
          }),
        }),
      })

      const result = await questService.startQuest(userId, 'quest-1')
      expect(result.status).toBe('active')
      expect(mockDb.insert).not.toHaveBeenCalled()
    })
  })

  describe('updateProgress', () => {
    it('updates progress for relevant quest', async () => {
      const activeRows = [{
        userQuest: makeUserQuest(),
        quest: mockQuest,
      }]
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(activeRows),
          }),
        }),
      })
      mockDb.update = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })

      const updated = await questService.updateProgress(userId, 'lesson_completed', {
        lessons_completed: 1,
      })

      expect(updated).toHaveLength(1)
      expect(updated[0]!.progress['lessons_completed']).toBe(1)
    })

    it('marks quest completed when target reached', async () => {
      const activeRows = [{
        userQuest: makeUserQuest({ progress: { lessons_completed: 4 } }),
        quest: mockQuest,
      }]
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(activeRows),
          }),
        }),
      })
      mockDb.update = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })
      mockDb.insert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          catch: vi.fn().mockResolvedValue(undefined),
        }),
      })

      const emitted = vi.fn()
      emitter.on('quest.completed', emitted)

      const updated = await questService.updateProgress(userId, 'lesson_completed', {
        lessons_completed: 1, // 4 + 1 = 5 >= target 5
      })

      expect(updated[0]!.status).toBe('completed')
      expect(emitted).toHaveBeenCalled()
    })

    it('ignores events not relevant to quest criteria', async () => {
      const activeRows = [{
        userQuest: makeUserQuest(),
        quest: mockQuest, // complete_lessons type
      }]
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(activeRows),
          }),
        }),
      })

      // streak.updated not relevant for complete_lessons quest
      const updated = await questService.updateProgress(userId, 'streak.updated', {
        streak_days: 5,
      })

      expect(updated).toHaveLength(0)
      expect(mockDb.update).not.toHaveBeenCalled()
    })
  })

  describe('getActiveQuests', () => {
    it('returns active quests with quest data', async () => {
      const uq = makeUserQuest()
      mockDb.select = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{
              ...uq,
              quest: mockQuest,
            }]),
          }),
        }),
      })

      const result = await questService.getActiveQuests(userId)
      expect(result).toHaveLength(1)
      expect(result[0]!.quest?.title).toBe('Complete 5 Lições')
    })
  })

  describe('completeQuest', () => {
    it('marks quest as completed', async () => {
      mockDb.update = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      })

      await questService.completeQuest(userId, 'quest-1')
      expect(mockDb.update).toHaveBeenCalled()
    })
  })

  describe('assignDailyQuests', () => {
    it('assigns available quests to user', async () => {
      const uq = makeUserQuest({ id: 'uq-new' })
      let callCount = 0

      mockDb.select = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // Available quests
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([mockQuest]),
              }),
            }),
          }
        } else {
          // Existing user quests
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          }
        }
      })

      mockDb.insert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([uq]),
        }),
      })

      const assigned = await questService.assignDailyQuests(userId)
      expect(assigned.length).toBeGreaterThan(0)
    })

    it('does not re-assign quests user already has', async () => {
      let callCount = 0

      mockDb.select = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([mockQuest]),
              }),
            }),
          }
        } else {
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([{ questId: 'quest-1' }]), // already assigned
            }),
          }
        }
      })

      const assigned = await questService.assignDailyQuests(userId)
      expect(assigned).toHaveLength(0)
      expect(mockDb.insert).not.toHaveBeenCalled()
    })
  })
})
