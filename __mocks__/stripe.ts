import { vi } from 'vitest'

const stripeMock = {
  checkout: {
    sessions: {
      create: vi.fn().mockResolvedValue({
        id: 'mock_session_123',
        url: 'https://checkout.stripe.com/mock',
      }),
    },
  },
  subscriptions: {
    retrieve: vi.fn().mockResolvedValue({
      id: 'sub_mock',
      status: 'active',
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 3600,
    }),
    cancel: vi.fn().mockResolvedValue({ status: 'canceled' }),
  },
  webhooks: {
    constructEvent: vi.fn().mockImplementation((body: string) => JSON.parse(body)),
  },
}

export default vi.fn(() => stripeMock)
