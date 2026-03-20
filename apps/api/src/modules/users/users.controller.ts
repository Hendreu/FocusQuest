// users.controller.ts — Thin HTTP handler layer for users module
import type { FastifyRequest, FastifyReply } from 'fastify'
import type { UsersService } from './users.service'
import { updatePreferencesSchema, updateProfileSchema } from './users.schema'

type ServiceError = Error & { statusCode?: number; code?: string }

function sendError(reply: FastifyReply, err: unknown) {
  const e = err as ServiceError
  return reply.status(e.statusCode ?? 500).send({
    error: e.message,
    code: e.code ?? 'INTERNAL_ERROR',
  })
}

export function buildUsersController(service: UsersService) {
  return {
    async getMe(req: FastifyRequest, reply: FastifyReply) {
      try {
        const profile = await service.getMe(req.user.id)
        return reply.send(profile)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async updateMe(req: FastifyRequest, reply: FastifyReply) {
      const parsed = updateProfileSchema.safeParse(req.body)
      if (!parsed.success) {
        return reply.status(400).send({ error: 'Validation error', issues: parsed.error.issues })
      }
      try {
        const updated = await service.updateProfile(req.user.id, parsed.data)
        return reply.send(updated)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async getPreferences(req: FastifyRequest, reply: FastifyReply) {
      try {
        const prefs = await service.getPreferences(req.user.id)
        return reply.send(prefs)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async updatePreferences(req: FastifyRequest, reply: FastifyReply) {
      const parsed = updatePreferencesSchema.safeParse(req.body)
      if (!parsed.success) {
        return reply.status(400).send({ error: 'Validation error', issues: parsed.error.issues })
      }
      try {
        const prefs = await service.updatePreferences(req.user.id, parsed.data)
        return reply.send(prefs)
      } catch (err) {
        return sendError(reply, err)
      }
    },
  }
}
