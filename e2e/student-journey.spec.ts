import { test, expect } from './fixtures'

test('student completes onboarding and first lesson', async ({ page, createUser }) => {
  // 1. Register via UI
  await page.goto('/auth/register')
  await page.fill('[name="name"]', 'Aluno Teste')
  await page.fill('[name="email"]', `student-${Date.now()}@test.com`)
  await page.fill('[name="password"]', 'TestPassword123!')
  await page.click('[type="submit"]')

  // 2. Assert redirect to /onboarding
  await expect(page).toHaveURL(/\/onboarding/)

  // 3. Step 1: preferred name
  await page.fill('[name="preferredName"]', 'Aluno')
  await page.click('[data-testid="step-continue"]')

  // 4. Step 2: avatar
  await page.click('.avatar-option[data-char="character-2"]')
  await page.click('[data-testid="step-continue"]')

  // 5. Step 3: sensory questions
  await page.click('[data-question="prefersMovement"][data-answer="false"]')
  await page.click('[data-question="soundHelps"][data-answer="true"]')
  await page.click('[data-question="shortSessions"][data-answer="true"]')
  await page.click('[data-testid="step-continue"]')

  // 6. Step 4: select course and start
  await page.click('[data-course="intro-programacao"]')
  await page.click('[data-testid="step-complete"]')

  // 7. Assert avatar configured
  const avatarRes = await page.request.get('/api/avatar/me')
  const avatarData = await avatarRes.json()
  expect(avatarData.base_character).toBe('character-2')

  // 8. Assert sensory_profile saved
  const prefRes = await page.request.get('/api/users/me/preferences')
  const prefData = await prefRes.json()
  expect(prefData.sensory_profile?.soundEnabled).toBe(true)
  expect(prefData.sensory_profile?.sessionLength).toBe('short')

  // 9. Complete a lesson via API (simulates player completing)
  const gamProfileRes = await page.request.get('/api/gamification/profile')
  const gamProfile = await gamProfileRes.json()
  const xpBefore = gamProfile.totalXP ?? 0

  await page.request.post('/api/progress/complete', {
    data: { lessonId: 'lesson-intro-1', score: 100, timeSpentSeconds: 300 },
  })

  // 10. Assert XP increased in profile
  await page.goto('/profile')
  const gamProfileAfterRes = await page.request.get('/api/gamification/profile')
  const gamProfileAfter = await gamProfileAfterRes.json()
  const xpAfter = gamProfileAfter.totalXP ?? 0
  expect(xpAfter).toBeGreaterThan(xpBefore)

  // Evidence screenshot
  await page.screenshot({ path: '.sisyphus/evidence/task-22-student-journey.png', fullPage: true })
})

// Export used identifier to avoid unused import lint warning
export { createUser } from './fixtures'
