import { FastifyPluginAsync } from 'fastify'
import EventEmitter from 'node:events'
import crypto from 'node:crypto'

export const gamificationFeedEmitter = new EventEmitter()

export interface FeedEvent {
  id: string
  type: string
  message: string
  timestamp: string
  userId?: string
  userName?: string
  avatarBaseCharacter?: string
  [key: string]: any
}

const recentEvents: FeedEvent[] = []

gamificationFeedEmitter.on('achievement', (event: Omit<FeedEvent, 'id' | 'timestamp'>) => {
  const fullEvent: FeedEvent = {
    type: event.type || 'achievement',
    message: event.message || '',
    ...event,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString()
  }
  recentEvents.unshift(fullEvent)
  if (recentEvents.length > 10) {
    recentEvents.pop()
  }
  gamificationFeedEmitter.emit('broadcast', fullEvent)
})

export const feedRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/gamification/feed', async (request, reply) => {
    reply.raw.setHeader('Content-Type', 'text/event-stream')
    reply.raw.setHeader('Cache-Control', 'no-cache')
    reply.raw.setHeader('Connection', 'keep-alive')
    reply.raw.setHeader('Access-Control-Allow-Origin', '*')

    // Send initial connected message
    reply.raw.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)

    const onEvent = (event: FeedEvent) => {
      reply.raw.write(`data: ${JSON.stringify(event)}\n\n`)
    }

    gamificationFeedEmitter.on('broadcast', onEvent)

    const heartbeat = setInterval(() => {
      reply.raw.write(':\n\n')
    }, 30000)

    request.raw.on('close', () => {
      gamificationFeedEmitter.off('broadcast', onEvent)
      clearInterval(heartbeat)
    })

    // Keeps the connection alive
    return reply.hijack()
  })

  fastify.get('/gamification/feed/recent', async () => {
    return recentEvents
  })
}
