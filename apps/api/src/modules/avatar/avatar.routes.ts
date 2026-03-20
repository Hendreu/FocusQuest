// avatar.routes.ts — Fastify plugin registering all avatar routes
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { db } from '../../db/index'
import { authMiddleware } from '../auth/auth.middleware'
import { AvatarService } from './avatar.service'
import { buildAvatarController } from './avatar.controller'

const avatarService = new AvatarService(db)
const ctrl = buildAvatarController(avatarService)

export const avatarRoutes = fp(
  async (fastify: FastifyInstance) => {
    // GET /avatar/me — get current user's avatar + coins
    fastify.get('/avatar/me', { preHandler: authMiddleware }, ctrl.getAvatar)

    // POST /avatar/equip — equip an item { item_id }
    fastify.post('/avatar/equip', { preHandler: authMiddleware }, ctrl.equip)

    // POST /avatar/unequip — unequip an item by type { item_type }
    fastify.post('/avatar/unequip', { preHandler: authMiddleware }, ctrl.unequip)

    // GET /avatar/shop — list all shop items with owned flag
    fastify.get('/avatar/shop', { preHandler: authMiddleware }, ctrl.getShop)

    // POST /avatar/shop/buy — purchase an item { item_id }
    fastify.post('/avatar/shop/buy', { preHandler: authMiddleware }, ctrl.buyItem)

    // GET /avatar/coins — get current user's coin balance
    fastify.get('/avatar/coins', { preHandler: authMiddleware }, ctrl.getCoins)

    // POST /avatar/character — select base character { character }
    fastify.post('/avatar/character', { preHandler: authMiddleware }, ctrl.selectCharacter)
  },
  { name: 'avatar-routes' },
)
