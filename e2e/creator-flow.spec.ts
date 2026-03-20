import { test, expect } from './fixtures'

test('creator submits lesson and admin approves', async ({ page, createUser }) => {
  const creator = await createUser({ name: 'Criador Teste', role: 'creator' })
  const admin = await createUser({ name: 'Admin App', role: 'super_admin' })
  const student = await createUser({ name: 'Aluno Reader' })

  // 1. Creator logs in and creates lesson
  await page.goto('/auth/login')
  await page.fill('[name="email"]', creator.email)
  await page.fill('[name="password"]', creator.password)
  await page.click('[type="submit"]')

  await page.goto('/creator/lessons/new')
  await page.fill('[data-testid="lesson-title"]', 'Lição E2E Teste')
  await page.fill('[data-testid="lesson-content"]', 'Conteúdo da lição de teste')
  await page.click('[data-testid="add-quiz-question"]')
  await page.fill('[data-testid="quiz-question-0"]', 'Qual é 2+2?')
  await page.fill('[data-testid="quiz-answer-0-0"]', '4')
  await page.click('[data-testid="quiz-correct-0-0"]')

  // 2. Submit for review
  await page.click('[data-testid="submit-for-review"]')
  await expect(page.locator('[data-testid="status-badge"]')).toHaveText('Em Revisão')

  // 3. Admin approves via API
  await page.request.post('/api/lessons/approve', {
    data: { lessonId: 'lesson-e2e-teste' },
    headers: { Authorization: `Bearer ${admin.token}` },
  })

  // 4. Student accesses approved lesson
  const lessonsRes = await page.request.get('/api/lessons?status=published', {
    headers: { Authorization: `Bearer ${student.token}` },
  })
  const lessonsData = await lessonsRes.json()
  const lessons: Array<{ title: string }> = Array.isArray(lessonsData)
    ? lessonsData
    : lessonsData.data ?? []
  expect(lessons.some((l) => l.title === 'Lição E2E Teste')).toBe(true)

  await page.screenshot({ path: '.sisyphus/evidence/task-22-creator-flow.png', fullPage: true })
})
