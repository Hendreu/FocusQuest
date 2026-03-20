import { FastifyPluginAsync } from 'fastify'
import { authMiddleware } from '../auth/auth.middleware'
import { notificationsService, sseConnections, pushSubscriptions } from './notifications.service'
import webpush from 'web-push'

export const notificationsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', async (req) => {
    const query = req.query as { token?: string }
    if (query?.token) {
      req.headers.authorization = `Bearer ${query.token}`
    }
  })

  // All routes in this plugin require authentication
  fastify.addHook('preHandler', authMiddleware)

  fastify.get('/', async (req, reply) => {
    const user = req.user as any
    const { unread_only } = req.query as { unread_only?: string }
    const unreadOnly = unread_only === 'true'
    
    const list = await notificationsService.list(user.id, unreadOnly)
    return { notifications: list }
  })

  fastify.post('/:id/read', async (req, reply) => {
    const user = req.user as any
    const { id } = req.params as { id: string }
    await notificationsService.markRead(user.id, id)
    return { success: true }
  })

  fastify.post('/read-all', async (req, reply) => {
    const user = req.user as any
    await notificationsService.markAllRead(user.id)
    return { success: true }
  })

  fastify.delete('/:id', async (req, reply) => {
    const user = req.user as any
    const { id } = req.params as { id: string }
    await notificationsService.delete(user.id, id)
    return { success: true }
  })

  // SSE Stream
  fastify.get('/stream', async (req, reply) => {
    const user = req.user as any
    
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    })

    const userId = user.id
    if (!sseConnections.has(userId)) {
      sseConnections.set(userId, new Set())
    }
    const connections = sseConnections.get(userId)!
    connections.add(reply)

    const heartbeat = setInterval(() => {
      reply.raw.write('data: {"type":"ping"}\n\n')
    }, 30000)

    req.raw.on('close', () => {
      clearInterval(heartbeat)
      connections.delete(reply)
      if (connections.size === 0) {
        sseConnections.delete(userId)
      }
    })

    // Keep the connection open
    return new Promise(() => {})
  })

  // Web Push
  fastify.post('/push/subscribe', async (req, reply) => {
    const user = req.user as any
    const { subscription } = req.body as { subscription: webpush.PushSubscription }
    
    if (!pushSubscriptions.has(user.id)) {
      pushSubscriptions.set(user.id, [])
    }
    const subs = pushSubscriptions.get(user.id)!
    subs.push(subscription)
    
    return { success: true }
  })

  fastify.post('/push/unsubscribe', async (req, reply) => {
    const user = req.user as any
    pushSubscriptions.delete(user.id)
    return { success: true }
  })

  fastify.get('/push/vapid-key', async (req, reply) => {
    return { 
      publicKey: process.env.VAPID_PUBLIC_KEY ?? 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9bdIF2Mdt36z7O0KeUKLk-lYf_rZhOg9Vp1jHhT6FdJcRfKBxwE4' 
    }
  })
}
