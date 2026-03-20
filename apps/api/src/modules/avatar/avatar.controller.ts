// avatar.controller.ts — Thin HTTP handler layer for avatar module
import type { FastifyRequest, FastifyReply } from 'fastify'
import type { AvatarService } from './avatar.service'
import {
  equipSchema,
  unequipSchema,
  buyItemSchema,
  selectCharacterSchema,
} from './avatar.schema'

type ServiceError = Error & {
  statusCode?: number
  code?: string
  balance?: number
  required?: number
}

function sendError(reply: FastifyReply, err: unknown) {
  const e = err as ServiceError
  const statusCode = e.statusCode ?? 500
  return reply.status(statusCode).send({
    error: e.message,
    code: e.code ?? 'INTERNAL_ERROR',
    ...(e.balance !== undefined && { balance: e.balance }),
    ...(e.required !== undefined && { required: e.required }),
  })
}

export function buildAvatarController(service: AvatarService) {
  return {
    async getAvatar(req: FastifyRequest, reply: FastifyReply) {
      try {
        const avatar = await service.getAvatar(req.user.id)
        return reply.send(avatar)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async equip(req: FastifyRequest, reply: FastifyReply) {
      const parsed = equipSchema.safeParse(req.body)
      if (!parsed.success) return reply.status(400).send({ error: 'Validation error', issues: parsed.error.issues })
      try {
        const updated = await service.equip(req.user.id, parsed.data)
        return reply.send(updated)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async unequip(req: FastifyRequest, reply: FastifyReply) {
      const parsed = unequipSchema.safeParse(req.body)
      if (!parsed.success) return reply.status(400).send({ error: 'Validation error', issues: parsed.error.issues })
      try {
        const updated = await service.unequip(req.user.id, parsed.data)
        return reply.send(updated)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async getShop(req: FastifyRequest, reply: FastifyReply) {
      try {
        const items = await service.getShop(req.user.id)
        return reply.send(items)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async buyItem(req: FastifyRequest, reply: FastifyReply) {
      const parsed = buyItemSchema.safeParse(req.body)
      if (!parsed.success) return reply.status(400).send({ error: 'Validation error', issues: parsed.error.issues })
      try {
        const result = await service.buyItem(req.user.id, parsed.data)
        return reply.send(result)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async getCoins(req: FastifyRequest, reply: FastifyReply) {
      try {
        const coins = await service.getCoins(req.user.id)
        return reply.send(coins)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async selectCharacter(req: FastifyRequest, reply: FastifyReply) {
      const parsed = selectCharacterSchema.safeParse(req.body)
      if (!parsed.success) return reply.status(400).send({ error: 'Validation error', issues: parsed.error.issues })
      try {
        const updated = await service.selectCharacter(req.user.id, parsed.data)
        return reply.send(updated)
      } catch (err) {
        return sendError(reply, err)
      }
    },
  }
}
