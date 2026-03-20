import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { runSandbox } from './sandbox.service'
import { authMiddleware } from '../auth/auth.middleware'

const runSchema = z.object({
  language: z.enum(['python', 'javascript']),
  code: z.string().min(1).max(10_000),
})

// Rate limit store: userId → { count, windowStart }
const rateLimitStore = new Map<string, { count: number; windowStart: number }>()
const RATE_LIMIT = 10
const WINDOW_MS = 60_000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(userId)

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitStore.set(userId, { count: 1, windowStart: now })
    return true
  }

  if (entry.count >= RATE_LIMIT) return false

  entry.count++
  return true
}

export async function sandboxRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/sandbox/run',
    { preHandler: [authMiddleware] },
    async (req: FastifyRequest, reply) => {
      const userId = (req as FastifyRequest & { user: { id: string } }).user.id

      if (!checkRateLimit(userId)) {
        return reply.status(429).send({ error: 'Rate limit exceeded (10 req/min)' })
      }

      const body = runSchema.safeParse(req.body)
      if (!body.success) {
        return reply.status(400).send({ error: 'Invalid input', details: body.error.flatten() })
      }

      const result = await runSandbox(body.data.language, body.data.code)

      return reply.send({ data: result })
    }
  )
}
