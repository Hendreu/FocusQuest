import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../auth/auth.middleware'
import { spacedRepetitionService } from './spaced-repetition.service'
import { z } from 'zod'

export async function spacedRepetitionRoutes(fastify: FastifyInstance) {
  // GET /spaced-repetition/due — items due for review today
  fastify.get(
    '/spaced-repetition/due',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const userId = (request.user as { id: string }).id
      const items = await spacedRepetitionService.getDueItems(userId)
      return reply.send({ data: items })
    },
  )

  // POST /spaced-repetition/review — record review result
  const reviewSchema = z.object({
    item_id: z.string().uuid(),
    quality: z.number().int().min(0).max(5),
  })

  fastify.post(
    '/spaced-repetition/review',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const body = reviewSchema.parse(request.body)
      const userId = (request.user as { id: string }).id
      const result = await spacedRepetitionService.recordReview(
        userId,
        body.item_id,
        body.quality,
      )
      return reply.send({ data: result })
    },
  )
}
