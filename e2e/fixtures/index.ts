import { test as base, expect } from '@playwright/test'

interface TestUser {
  id: string
  email: string
  password: string
  name: string
  token: string
}

interface TestFixtures {
  apiUrl: string
  createUser: (overrides?: Partial<Omit<TestUser, 'id' | 'token'>> & { role?: string }) => Promise<TestUser>
  loginAs: (user: TestUser) => Promise<void>
  createInstitution: (adminToken: string, name: string) => Promise<{ id: string }>
}

export const test = base.extend<TestFixtures>({
  apiUrl: async ({}, use) => {
    await use(process.env.API_URL || 'http://localhost:3001')
  },

  createUser: async ({ apiUrl }, use) => {
    await use(async (overrides = {}) => {
      const { role: _role, ...rest } = overrides as { role?: string } & Partial<TestUser>
      const user = {
        email: `test-${Date.now()}@focusquest.test`,
        password: 'TestPassword123!',
        name: 'Test User',
        ...rest,
      }
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      })
      const data = await res.json()
      return { ...user, id: data.user?.id ?? '', token: data.accessToken ?? '' }
    })
  },

  loginAs: async ({ page }, use) => {
    await use(async (user: TestUser) => {
      // Inject token directly into localStorage (faster than form login)
      await page.goto('/')
      await page.evaluate((token) => {
        localStorage.setItem('accessToken', token)
      }, user.token)
    })
  },

  createInstitution: async ({ apiUrl }, use) => {
    await use(async (adminToken: string, name: string) => {
      const res = await fetch(`${apiUrl}/institutions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ name, plan: 'free' }),
      })
      return res.json()
    })
  },
})

export { expect }
