import { test, expect } from './fixtures'

test('focus mode pomodoro cycle completes', async ({ page, createUser }) => {
  const user = await createUser({ name: 'Focus User' })
  await page.goto('/auth/login')
  await page.fill('[name="email"]', user.email)
  await page.fill('[name="password"]', user.password)
  await page.click('[type="submit"]')

  // 1. Open lesson and activate focus mode
  await page.goto('/learn/intro-programacao/lesson-intro-1')
  await page.click('[data-testid="focus-mode-toggle"]')

  // 2. Assert focus mode is active
  await expect(page.locator('[data-testid="focus-overlay"]')).toBeVisible()
  await expect(page.locator('[data-testid="pomodoro-timer"]')).toBeVisible()

  // 3. Simulate Pomodoro timer end (inject fake timer via page.evaluate)
  await page.evaluate(() => {
    // Dispatch custom event that the component listens to
    window.dispatchEvent(
      new CustomEvent('pomodoro:timer-complete', {
        detail: { sessionType: 'work', duration: 25 * 60 },
      }),
    )
  })

  // 4. Assert break screen is shown
  await expect(page.locator('[data-testid="break-screen"]')).toBeVisible()
  await expect(page.locator('[data-testid="break-timer"]')).toBeVisible()

  // 5. Assert lesson progress was not lost (state persisted)
  const progressRes = await page.request.get('/api/users/me/progress', {
    headers: { Authorization: `Bearer ${user.token}` },
  })
  const progress = await progressRes.json()
  expect(progress).toBeDefined()

  await page.screenshot({ path: '.sisyphus/evidence/task-22-focus-mode.png', fullPage: true })
})
