import { test, expect } from './fixtures'

test('institution admin manages student', async ({ page, createUser, createInstitution }) => {
  // 1. Create admin and log in
  const admin = await createUser({ name: 'Admin Inst' })
  await page.goto('/auth/login')
  await page.fill('[name="email"]', admin.email)
  await page.fill('[name="password"]', admin.password)
  await page.click('[type="submit"]')

  // 2. Create institution via UI
  await page.goto('/admin/institutions/new')
  await page.fill('[name="institutionName"]', 'Escola Teste')
  await page.click('[data-testid="create-institution"]')
  await expect(page.locator('[data-testid="institution-created"]')).toBeVisible()

  // 3. Invite student
  const student = await createUser({ name: 'Aluno Convidado' })
  await page.goto('/admin/institutions/members')
  await page.fill('[name="inviteEmail"]', student.email)
  await page.click('[data-testid="send-invite"]')
  await expect(page.locator('[data-testid="invite-sent"]')).toBeVisible()

  // 4. Student accepts invite (via API — simulates clicking email link)
  const inviteRes = await page.request.get(`/api/institutions/invites?email=${student.email}`)
  const inviteData = await inviteRes.json()
  const inviteToken: string = inviteData.token ?? ''
  await page.request.post('/api/institutions/invites/accept', {
    data: { token: inviteToken },
    headers: { Authorization: `Bearer ${student.token}` },
  })

  // 5. Student completes a lesson
  await page.request.post('/api/progress/complete', {
    data: { lessonId: 'lesson-intro-1', score: 80, timeSpentSeconds: 200 },
    headers: { Authorization: `Bearer ${student.token}` },
  })

  // 6. Admin sees student progress
  await page.goto('/admin/institutions/members')
  await expect(
    page.locator(`[data-student="${student.id}"] [data-testid="xp-count"]`),
  ).not.toHaveText('0')

  await page.screenshot({ path: '.sisyphus/evidence/task-22-institution-flow.png', fullPage: true })
})
