import { eq } from 'drizzle-orm'
import { db } from '../../db/index'
import { users } from '../../db/schema'
import { stripe } from './stripe.client'
import Stripe from 'stripe'

export class BillingService {
  async createCheckoutSession(userId: string, successUrl: string, cancelUrl: string) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [
        {
          price_data: {
            currency: 'BRL',
            product_data: {
              name: 'FocusQuest Premium (Individual)',
              description: 'Acesso ilimitado a todas as lições, missões e itens de avatar.',
            },
            unit_amount: 990, // R$ 9,90
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: userId,
        plan: 'premium_individual',
      },
    })

    return { checkout_url: session.url }
  }

  async handleWebhook(rawBody: string | Buffer, signature: string, webhookSecret: string) {
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err: any) {
      throw new Error(`Webhook Error: ${err.message}`)
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const plan = session.metadata?.plan as 'free' | 'premium_individual' | 'premium_institution'

      if (userId && plan) {
        await db.update(users).set({ plan }).where(eq(users.id, userId))
      }
    }

    return { received: true }
  }

  async getStatus(userId: string) {
    const [user] = await db
      .select({ plan: users.plan, updatedAt: users.updatedAt })
      .from(users)
      .where(eq(users.id, userId))

    if (!user) {
      throw new Error('User not found')
    }

    return { plan: user.plan, upgraded_at: user.updatedAt }
  }
}
