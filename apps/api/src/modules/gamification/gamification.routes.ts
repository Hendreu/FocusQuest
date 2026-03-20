// gamification.routes.ts — REST endpoints for gamification
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import { GamificationService } from './gamification.service'
import { db } from '../../db/index'
import { authMiddleware } from '../auth/auth.middleware'

const gamificationService = new GamificationService(db)

export const gamificationRoutes = fp(
  async (fastify: FastifyInstance) => {
    // GET /gamification/profile — full gamification profile
    fastify.get(
      '/gamification/profile',
      { preHandler: authMiddleware },
      async (request: FastifyRequest, reply: FastifyReply) => {
        const { id: userId } = request.user
        const profile = await gamificationService.getProfile(userId)
        return reply.send(profile)
      },
    )

    // GET /gamification/leaderboard — global or weekly top 100
    fastify.get<{ Querystring: { type?: string; page?: string } }>(
      '/gamification/leaderboard',
      { preHandler: authMiddleware },
      async (request, reply) => {
        const type =
          request.query.type === 'weekly' ? 'weekly' : 'all_time'
        const page = request.query.page ? parseInt(request.query.page, 10) : 1
        const result = await gamificationService.getLeaderboard(type, page)
        return reply.send(result)
      },
    )

    // GET /gamification/leaderboard/me — personal rank
    fastify.get(
      '/gamification/leaderboard/me',
      { preHandler: authMiddleware },
      async (request: FastifyRequest, reply: FastifyReply) => {
        const { id: userId } = request.user
        const result = await gamificationService.getUserRank(userId)
        return reply.send(result)
      },
    )

    // GET /gamification/quests — active quests
    fastify.get(
      '/gamification/quests',
      { preHandler: authMiddleware },
      async (request: FastifyRequest, reply: FastifyReply) => {
        const { id: userId } = request.user
        const quests = await gamificationService.getActiveQuests(userId)
        return reply.send(quests)
      },
    )

    // POST /gamification/quests/:id/start — start a quest
    fastify.post<{ Params: { id: string } }>(
      '/gamification/quests/:id/start',
      { preHandler: authMiddleware },
      async (request, reply) => {
        const { id: userId } = request.user
        const questId = request.params.id
        const userQuest = await gamificationService.startQuest(userId, questId)
        return reply.status(201).send(userQuest)
      },
    )

    // GET /gamification/badges — user's earned badges
    fastify.get(
      '/gamification/badges',
      { preHandler: authMiddleware },
      async (request: FastifyRequest, reply: FastifyReply) => {
        const { id: userId } = request.user
        const badges = await gamificationService.getUserBadges(userId)
        return reply.send(badges)
      },
    )

    // POST /progress/complete — complete a lesson, trigger gamification
    fastify.post<{
      Body: {
        lessonId: string
        score?: number
        timeSpentSeconds?: number
      }
    }>(
      '/progress/complete',
      { preHandler: authMiddleware },
      async (request, reply) => {
        const { id: userId } = request.user
        const { lessonId, score, timeSpentSeconds } = request.body

        if (!lessonId) {
          return reply.status(400).send({ error: 'lessonId is required' })
        }

        const result = await gamificationService.completeLessonProgress(
          userId,
          lessonId,
          score,
          timeSpentSeconds,
        )

        return reply.status(200).send(result)
      },
    )
  },
  { name: 'gamification-routes' },
)
