import { test, expect } from './fixtures'

test('free user upgrades to premium', async ({ page, createUser }) => {
  const user = await createUser({ name: 'Free User' })
  await page.goto('/auth/login')
  await page.fill('[name="email"]', user.email)
  await page.fill('[name="password"]', user.password)
  await page.click('[type="submit"]')

  // 1. Access premium content (should show paywall)
  await page.goto('/learn/premium-course-slug')
  await expect(page.locator('[data-testid="paywall-banner"]')).toBeVisible()
  await expect(page.locator('[data-testid="lesson-content"]')).not.toBeVisible()

  // 2. Click Upgrade
  await page.click('[data-testid="upgrade-button"]')
  await expect(page).toHaveURL(/\/pricing/)

  // 3. Select Pro plan
  await page.click('[data-plan="pro"] [data-testid="select-plan"]')

  // 4. Mock Stripe via page.route() — intercept checkout call
  await page.route('**/api/billing/create-checkout-session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ checkoutUrl: '/upgrade/success?session_id=mock_session_123' }),
    })
  })

  // Simulate Stripe success webhook via direct API call
  await page.request.post('/api/webhooks/stripe', {
    data: JSON.stringify({
      type: 'checkout.session.completed',
      data: { object: { client_reference_id: user.id, metadata: { plan: 'pro' } } },
    }),
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'mock_sig',
    },
  })

  // 5. Assert user now has pro plan
  const profileRes = await page.request.get('/api/users/me', {
    headers: { Authorization: `Bearer ${user.token}` },
  })
  const profile = await profileRes.json()
  expect(profile.plan).toBe('pro')

  // 6. Access premium content again — should work
  await page.goto('/learn/premium-course-slug')
  await expect(page.locator('[data-testid="paywall-banner"]')).not.toBeVisible()
  await expect(page.locator('[data-testid="lesson-content"]')).toBeVisible()

  await page.screenshot({ path: '.sisyphus/evidence/task-22-paywall-upgrade.png', fullPage: true })
})
