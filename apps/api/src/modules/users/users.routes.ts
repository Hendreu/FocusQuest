// users.routes.ts — Fastify plugin registering /users/me routes
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { db } from '../../db/index'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { authMiddleware } from '../auth/auth.middleware'
import { UsersService } from './users.service'
import { buildUsersController } from './users.controller'

const usersService = new UsersService(db)
const ctrl = buildUsersController(usersService)

export const usersRoutes = fp(
  async (fastify: FastifyInstance) => {
    // GET /users/me — full profile with preferences, XP, streak, badges, avatar
    fastify.get('/users/me', { preHandler: authMiddleware }, ctrl.getMe)

    // PATCH /users/me — update name
    fastify.patch('/users/me', { preHandler: authMiddleware }, ctrl.updateMe)

    // GET /users/me/preferences — get preferences
    fastify.get('/users/me/preferences', { preHandler: authMiddleware }, ctrl.getPreferences)

    // PATCH /users/me/preferences — partial update
    fastify.patch('/users/me/preferences', { preHandler: authMiddleware }, ctrl.updatePreferences)

    // PATCH /users/me/onboarding
    fastify.patch<{ Body: { onboarding_completed: boolean } }>(
      '/users/me/onboarding',
      { preHandler: authMiddleware },
      async (request, reply) => {
        const userId = request.user.id
        const { onboarding_completed } = request.body

        await db
          .update(users)
          .set({ onboardingCompleted: onboarding_completed })
          .where(eq(users.id, userId))

        return reply.status(200).send({ ok: true })
      }
    )
  },
  { name: 'users-routes' },
)
