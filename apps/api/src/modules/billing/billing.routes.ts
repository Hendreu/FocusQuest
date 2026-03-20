import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import { BillingService } from './billing.service'
import { authMiddleware } from '../auth/auth.middleware'

const billingService = new BillingService()

export const billingRoutes = fp(
  async (fastify: FastifyInstance) => {
    // We need the raw body for Stripe webhook signature verification
    fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
      if (req.url === '/webhooks/stripe') {
        done(null, body) // keep as string
      } else {
        try {
          done(null, JSON.parse(body as string))
        } catch (err: any) {
          err.statusCode = 400
          done(err, undefined)
        }
      }
    })

    fastify.post<{ Body: { success_url: string; cancel_url: string } }>(
      '/billing/create-checkout-session',
      { preHandler: authMiddleware },
      async (request, reply) => {
        try {
          const userId = request.user.id
          const { success_url, cancel_url } = request.body
          const result = await billingService.createCheckoutSession(userId, success_url, cancel_url)
          return reply.send(result)
        } catch (error: any) {
          fastify.log.error(error)
          return reply.status(500).send({ error: error.message })
        }
      },
    )

    fastify.post(
      '/webhooks/stripe',
      async (request: FastifyRequest, reply: FastifyReply) => {
        const signature = request.headers['stripe-signature'] as string
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_test_placeholder'
        
        try {
          // body is string because of addContentTypeParser above
          const rawBody = request.body as string
          const result = await billingService.handleWebhook(rawBody, signature, webhookSecret)
          return reply.send(result)
        } catch (error: any) {
          fastify.log.error(error)
          return reply.status(400).send({ error: `Webhook Error: ${error.message}` })
        }
      },
    )

    fastify.get(
      '/billing/status',
      { preHandler: authMiddleware },
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          const userId = request.user.id
          const result = await billingService.getStatus(userId)
          return reply.send(result)
        } catch (error: any) {
          fastify.log.error(error)
          return reply.status(404).send({ error: error.message })
        }
      },
    )
  },
  { name: 'billing-routes' }
)
