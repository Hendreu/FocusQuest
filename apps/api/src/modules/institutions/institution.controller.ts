// institution.controller.ts — Thin HTTP handler layer for institution module
import type { FastifyRequest, FastifyReply } from 'fastify'
import type { InstitutionService } from './institution.service'
import {
  createInstitutionSchema,
  updateInstitutionSchema,
  generateInviteSchema,
  acceptInviteSchema,
} from './institution.schema'

type ServiceError = Error & { statusCode?: number; code?: string; seats_used?: number; limit?: number }

function sendError(reply: FastifyReply, err: unknown) {
  const e = err as ServiceError
  return reply.status(e.statusCode ?? 500).send({
    error: e.message,
    code: e.code ?? 'INTERNAL_ERROR',
    ...(e.seats_used !== undefined && { seats_used: e.seats_used }),
    ...(e.limit !== undefined && { limit: e.limit }),
  })
}

export function buildInstitutionController(service: InstitutionService) {
  return {
    async createInstitution(req: FastifyRequest, reply: FastifyReply) {
      const parsed = createInstitutionSchema.safeParse(req.body)
      if (!parsed.success) {
        return reply.status(400).send({ error: 'Validation error', issues: parsed.error.issues })
      }
      try {
        const institution = await service.create(req.user.id, parsed.data)
        return reply.status(201).send(institution)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async getInstitution(req: FastifyRequest, reply: FastifyReply) {
      const { id } = req.params as { id: string }
      try {
        const institution = await service.getById(id)
        return reply.send(institution)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async updateInstitution(req: FastifyRequest, reply: FastifyReply) {
      const { id } = req.params as { id: string }
      const parsed = updateInstitutionSchema.safeParse(req.body)
      if (!parsed.success) {
        return reply.status(400).send({ error: 'Validation error', issues: parsed.error.issues })
      }
      try {
        const institution = await service.update(id, parsed.data)
        return reply.send(institution)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async generateInvite(req: FastifyRequest, reply: FastifyReply) {
      const { id } = req.params as { id: string }
      const parsed = generateInviteSchema.safeParse(req.body)
      if (!parsed.success) {
        return reply.status(400).send({ error: 'Validation error', issues: parsed.error.issues })
      }
      try {
        const result = await service.generateInvite(req.user.id, id, parsed.data)
        return reply.status(201).send(result)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async acceptInvite(req: FastifyRequest, reply: FastifyReply) {
      const parsed = acceptInviteSchema.safeParse(req.body)
      if (!parsed.success) {
        return reply.status(400).send({ error: 'Validation error', issues: parsed.error.issues })
      }
      try {
        const member = await service.acceptInvite(req.user.id, parsed.data.token)
        return reply.status(201).send(member)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async listMembers(req: FastifyRequest, reply: FastifyReply) {
      const { id } = req.params as { id: string }
      const { page } = req.query as { page?: string }
      try {
        const result = await service.listMembers(id, page ? parseInt(page, 10) : 1)
        return reply.send(result)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async removeMember(req: FastifyRequest, reply: FastifyReply) {
      const { id, userId } = req.params as { id: string; userId: string }
      try {
        await service.removeMember(req.user.id, id, userId)
        return reply.status(204).send()
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async getStats(req: FastifyRequest, reply: FastifyReply) {
      const { id } = req.params as { id: string }
      try {
        const stats = await service.getStats(id)
        return reply.send(stats)
      } catch (err) {
        return sendError(reply, err)
      }
    },
  }
}
