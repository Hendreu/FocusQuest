// content.service.ts — Business logic for courses, modules, lessons
import { eq, and, asc, inArray, sql } from 'drizzle-orm'
import type { Database } from '../../db/index'
import {
  courses,
  modules,
  lessons,
  lessonContent,
  userProgress,
  users,
} from '../../db/schema'
import type {
  CreateCourseInput,
  UpdateCourseInput,
  CourseStatusInput,
  CreateModuleInput,
  UpdateModuleInput,
  ReorderInput,
  CreateLessonInput,
  UpdateLessonInput,
  SaveLessonContentInput,
} from './content.schema'

// Status transition rules
const ALLOWED_TRANSITIONS: Record<string, Record<string, string[]>> = {
  creator: {
    draft: ['review'],
  },
  admin: {
    draft: ['review', 'published', 'archived'],
    review: ['published', 'draft', 'archived'],
    published: ['archived', 'draft'],
    archived: ['draft'],
  },
  super_admin: {
    draft: ['review', 'published', 'archived'],
    review: ['published', 'draft', 'archived'],
    published: ['archived', 'draft'],
    archived: ['draft'],
  },
}

export class ContentService {
  constructor(private db: Database) {}

  // -------------------------------------------------------------------------
  // Access control
  // -------------------------------------------------------------------------

  async assertCanEdit(userId: string, courseId: string): Promise<void> {
    const [course] = await this.db
      .select({ creatorId: courses.creatorId })
      .from(courses)
      .where(eq(courses.id, courseId))

    if (!course) {
      throw Object.assign(new Error('Course not found'), { statusCode: 404, code: 'COURSE_NOT_FOUND' })
    }

    const [user] = await this.db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))

    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 })
    }

    const isAdmin = user.role === 'super_admin' || user.role === 'institution_admin'
    if (course.creatorId !== userId && !isAdmin) {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403, code: 'FORBIDDEN' })
    }
  }

  async checkPremiumAccess(userId: string, lessonId: string): Promise<boolean> {
    const [lesson] = await this.db
      .select({ isPremium: lessons.isPremium })
      .from(lessons)
      .where(eq(lessons.id, lessonId))

    if (!lesson) {
      throw Object.assign(new Error('Lesson not found'), { statusCode: 404, code: 'LESSON_NOT_FOUND' })
    }

    if (!lesson.isPremium) return true

    const [user] = await this.db
      .select({ plan: users.plan })
      .from(users)
      .where(eq(users.id, userId))

    return user?.plan !== 'free'
  }

  async assertFreeLessonLimit(userId: string, lessonId: string): Promise<void> {
    // Fetch lesson → module → course for context
    const [lessonRow] = await this.db
      .select({ moduleId: lessons.moduleId })
      .from(lessons)
      .where(eq(lessons.id, lessonId))

    if (!lessonRow) {
      throw Object.assign(new Error('Lesson not found'), { statusCode: 404, code: 'LESSON_NOT_FOUND' })
    }

    const [moduleRow] = await this.db
      .select({ courseId: modules.courseId })
      .from(modules)
      .where(eq(modules.id, lessonRow.moduleId))

    if (!moduleRow) return

    // Get all free lessons in the course
    const courseModules = await this.db
      .select({ id: modules.id })
      .from(modules)
      .where(eq(modules.courseId, moduleRow.courseId))

    const moduleIds = courseModules.map((m) => m.id)
    if (moduleIds.length === 0) return

    const freeLessonsInCourse = await this.db
      .select({ id: lessons.id })
      .from(lessons)
      .where(and(inArray(lessons.moduleId, moduleIds), eq(lessons.isPremium, false)))

    const freeLessonIds = freeLessonsInCourse.map((l) => l.id)
    if (freeLessonIds.length === 0) return

    // Count how many free lessons this user has completed in this course
    const completed = await this.db
      .select({ lessonId: userProgress.lessonId })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          inArray(userProgress.lessonId, freeLessonIds),
          sql`${userProgress.completedAt} IS NOT NULL`,
        ),
      )

    const FREE_LESSON_LIMIT = 3
    if (completed.length >= FREE_LESSON_LIMIT) {
      throw Object.assign(
        new Error('Free lesson limit reached'),
        {
          statusCode: 403,
          code: 'FREE_LESSON_LIMIT_REACHED',
          limit: FREE_LESSON_LIMIT,
        },
      )
    }
  }

  // -------------------------------------------------------------------------
  // Courses
  // -------------------------------------------------------------------------

  async createCourse(userId: string, input: CreateCourseInput) {
    const [course] = await this.db
      .insert(courses)
      .values({
        title: input.title,
        description: input.description,
        language: input.language as 'pt-BR' | 'en',
        thumbnailUrl: input.thumbnail_url,
        creatorId: userId,
        status: 'draft',
      })
      .returning()

    return course
  }

  async listCourses(opts: { lang?: string; search?: string; page?: number; limit?: number }) {
    const page = opts.page ?? 1
    const limit = opts.limit ?? 20
    const offset = (page - 1) * limit

    let query = this.db
      .select()
      .from(courses)
      .where(eq(courses.status, 'published'))

    // Note: For simple filtering, apply after fetch (avoiding complex conditional Drizzle query building)
    const results = await query.limit(limit).offset(offset)

    // Client-side filtering for language and search
    let filtered = results
    if (opts.lang) {
      filtered = filtered.filter((c) => c.language === opts.lang)
    }
    if (opts.search) {
      const q = opts.search.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description?.toLowerCase().includes(q) ?? false),
      )
    }

    return { courses: filtered, page, limit }
  }

  async getCourse(courseId: string) {
    const [course] = await this.db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))

    if (!course) {
      throw Object.assign(new Error('Course not found'), { statusCode: 404, code: 'COURSE_NOT_FOUND' })
    }

    return course
  }

  async getCurriculum(courseId: string, userId?: string) {
    const course = await this.getCourse(courseId)

    const courseModules = await this.db
      .select()
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(asc(modules.order))

    const moduleIds = courseModules.map((m) => m.id)

    let allLessons: typeof lessons.$inferSelect[] = []
    if (moduleIds.length > 0) {
      allLessons = await this.db
        .select()
        .from(lessons)
        .where(inArray(lessons.moduleId, moduleIds))
        .orderBy(asc(lessons.order))
    }

    // Build nested structure
    const modulesWithLessons = courseModules.map((m) => ({
      ...m,
      lessons: allLessons
        .filter((l) => l.moduleId === m.id)
        .map((l) => ({
          id: l.id,
          title: l.title,
          content_type: l.contentType,
          duration_minutes: l.durationMinutes,
          is_premium: l.isPremium,
          order: l.order,
        })),
    }))

    const totalDurationMinutes = allLessons.reduce((sum, l) => sum + l.durationMinutes, 0)
    const totalLessons = allLessons.length

    // User progress
    let userProgressData: { completedLessonIds: string[]; percentComplete: number } | undefined
    if (userId && allLessons.length > 0) {
      const lessonIds = allLessons.map((l) => l.id)
      const progressRows = await this.db
        .select({ lessonId: userProgress.lessonId })
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, userId),
            inArray(userProgress.lessonId, lessonIds),
            sql`${userProgress.completedAt} IS NOT NULL`,
          ),
        )

      const completedLessonIds = progressRows.map((p) => p.lessonId)
      const percentComplete =
        lessonIds.length > 0
          ? Math.round((completedLessonIds.length / lessonIds.length) * 100)
          : 0

      userProgressData = { completedLessonIds, percentComplete }
    }

    return {
      course,
      modules: modulesWithLessons,
      totalDurationMinutes,
      totalLessons,
      ...(userProgressData !== undefined ? { userProgress: userProgressData } : {}),
    }
  }

  async updateCourse(userId: string, courseId: string, input: UpdateCourseInput) {
    await this.assertCanEdit(userId, courseId)

    const [updated] = await this.db
      .update(courses)
      .set({
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.language !== undefined && { language: input.language as 'pt-BR' | 'en' }),
        ...(input.thumbnail_url !== undefined && { thumbnailUrl: input.thumbnail_url }),
        updatedAt: new Date(),
      })
      .where(eq(courses.id, courseId))
      .returning()

    return updated
  }

  async deleteCourse(courseId: string) {
    await this.db.delete(courses).where(eq(courses.id, courseId))
  }

  async updateCourseStatus(userId: string, courseId: string, input: CourseStatusInput) {
    const course = await this.getCourse(courseId)

    const [user] = await this.db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))

    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 })
    }

    const isCreator = course.creatorId === userId
    const isAdmin = user.role === 'super_admin' || user.role === 'institution_admin'

    if (!isCreator && !isAdmin) {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403, code: 'FORBIDDEN' })
    }

    const roleKey = isAdmin ? 'admin' : 'creator'
    const allowed = ALLOWED_TRANSITIONS[roleKey]?.[course.status] ?? []

    if (!allowed.includes(input.status)) {
      throw Object.assign(
        new Error(`Transition from '${course.status}' to '${input.status}' not allowed for role '${roleKey}'`),
        { statusCode: 403, code: 'INVALID_STATUS_TRANSITION' },
      )
    }

    const [updated] = await this.db
      .update(courses)
      .set({ status: input.status as 'draft' | 'review' | 'published' | 'archived', updatedAt: new Date() })
      .where(eq(courses.id, courseId))
      .returning()

    return updated
  }

  // -------------------------------------------------------------------------
  // Modules
  // -------------------------------------------------------------------------

  async createModule(userId: string, courseId: string, input: CreateModuleInput) {
    await this.assertCanEdit(userId, courseId)

    const [module] = await this.db
      .insert(modules)
      .values({ courseId, title: input.title, order: input.order })
      .returning()

    return module
  }

  async listModules(courseId: string) {
    return this.db
      .select()
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(asc(modules.order))
  }

  async updateModule(userId: string, moduleId: string, input: UpdateModuleInput) {
    const [moduleRow] = await this.db
      .select({ courseId: modules.courseId })
      .from(modules)
      .where(eq(modules.id, moduleId))

    if (!moduleRow) {
      throw Object.assign(new Error('Module not found'), { statusCode: 404, code: 'MODULE_NOT_FOUND' })
    }

    await this.assertCanEdit(userId, moduleRow.courseId)

    const [updated] = await this.db
      .update(modules)
      .set({
        ...(input.title !== undefined && { title: input.title }),
        ...(input.order !== undefined && { order: input.order }),
      })
      .where(eq(modules.id, moduleId))
      .returning()

    return updated
  }

  async deleteModule(userId: string, moduleId: string) {
    const [moduleRow] = await this.db
      .select({ courseId: modules.courseId })
      .from(modules)
      .where(eq(modules.id, moduleId))

    if (!moduleRow) {
      throw Object.assign(new Error('Module not found'), { statusCode: 404, code: 'MODULE_NOT_FOUND' })
    }

    await this.assertCanEdit(userId, moduleRow.courseId)

    // Cascade: lessons are FK with onDelete: 'cascade', but delete explicitly for safety
    const moduleLessons = await this.db
      .select({ id: lessons.id })
      .from(lessons)
      .where(eq(lessons.moduleId, moduleId))

    if (moduleLessons.length > 0) {
      const lessonIds = moduleLessons.map((l) => l.id)
      await this.db.delete(lessonContent).where(inArray(lessonContent.lessonId, lessonIds))
      await this.db.delete(lessons).where(eq(lessons.moduleId, moduleId))
    }

    await this.db.delete(modules).where(eq(modules.id, moduleId))
  }

  async reorderModules(userId: string, items: ReorderInput) {
    for (const item of items) {
      const [moduleRow] = await this.db
        .select({ courseId: modules.courseId })
        .from(modules)
        .where(eq(modules.id, item.id))

      if (moduleRow) {
        await this.assertCanEdit(userId, moduleRow.courseId)
        await this.db
          .update(modules)
          .set({ order: item.order })
          .where(eq(modules.id, item.id))
      }
    }
  }

  // -------------------------------------------------------------------------
  // Lessons
  // -------------------------------------------------------------------------

  async createLesson(userId: string, moduleId: string, input: CreateLessonInput) {
    const [moduleRow] = await this.db
      .select({ courseId: modules.courseId })
      .from(modules)
      .where(eq(modules.id, moduleId))

    if (!moduleRow) {
      throw Object.assign(new Error('Module not found'), { statusCode: 404, code: 'MODULE_NOT_FOUND' })
    }

    await this.assertCanEdit(userId, moduleRow.courseId)

    const [lesson] = await this.db
      .insert(lessons)
      .values({
        moduleId,
        title: input.title,
        contentType: input.content_type as 'text' | 'video' | 'quiz' | 'code',
        durationMinutes: input.duration_minutes,
        isPremium: input.is_premium ?? false,
        order: input.order,
        status: 'draft',
      })
      .returning()

    return lesson
  }

  async getLesson(lessonId: string) {
    const [lesson] = await this.db
      .select()
      .from(lessons)
      .where(eq(lessons.id, lessonId))

    if (!lesson) {
      throw Object.assign(new Error('Lesson not found'), { statusCode: 404, code: 'LESSON_NOT_FOUND' })
    }

    return lesson
  }

  async getLessonWithContent(lessonId: string, userId?: string) {
    const lesson = await this.getLesson(lessonId)

    // Check premium access if user provided
    if (userId && lesson.isPremium) {
      const hasAccess = await this.checkPremiumAccess(userId, lessonId)
      if (!hasAccess) {
        const [moduleRow] = await this.db
          .select({ courseId: modules.courseId })
          .from(modules)
          .where(eq(modules.id, lesson.moduleId))

        throw Object.assign(
          new Error('Premium content'),
          {
            statusCode: 403,
            code: 'PREMIUM_REQUIRED',
            lesson_id: lessonId,
            course_id: moduleRow?.courseId,
          },
        )
      }
    }

    const [content] = await this.db
      .select()
      .from(lessonContent)
      .where(eq(lessonContent.lessonId, lessonId))

    return { ...lesson, content: content ?? null }
  }

  async getLessonContent(lessonId: string, userId: string) {
    const lesson = await this.getLesson(lessonId)

    // Check premium access
    if (lesson.isPremium) {
      const hasAccess = await this.checkPremiumAccess(userId, lessonId)
      if (!hasAccess) {
        const [moduleRow] = await this.db
          .select({ courseId: modules.courseId })
          .from(modules)
          .where(eq(modules.id, lesson.moduleId))

        throw Object.assign(
          new Error('Premium content'),
          {
            statusCode: 403,
            code: 'PREMIUM_REQUIRED',
            lesson_id: lessonId,
            course_id: moduleRow?.courseId,
          },
        )
      }
    }

    // Check free lesson limit for free users
    const [user] = await this.db
      .select({ plan: users.plan })
      .from(users)
      .where(eq(users.id, userId))

    if (user?.plan === 'free' && !lesson.isPremium) {
      await this.assertFreeLessonLimit(userId, lessonId)
    }

    const [content] = await this.db
      .select()
      .from(lessonContent)
      .where(eq(lessonContent.lessonId, lessonId))

    return { lesson, content: content ?? null }
  }

  async updateLesson(userId: string, lessonId: string, input: UpdateLessonInput) {
    const lesson = await this.getLesson(lessonId)

    const [moduleRow] = await this.db
      .select({ courseId: modules.courseId })
      .from(modules)
      .where(eq(modules.id, lesson.moduleId))

    if (!moduleRow) {
      throw Object.assign(new Error('Module not found'), { statusCode: 404 })
    }

    await this.assertCanEdit(userId, moduleRow.courseId)

    const [updated] = await this.db
      .update(lessons)
      .set({
        ...(input.title !== undefined && { title: input.title }),
        ...(input.content_type !== undefined && { contentType: input.content_type as 'text' | 'video' | 'quiz' | 'code' }),
        ...(input.duration_minutes !== undefined && { durationMinutes: input.duration_minutes }),
        ...(input.is_premium !== undefined && { isPremium: input.is_premium }),
        ...(input.order !== undefined && { order: input.order }),
      })
      .where(eq(lessons.id, lessonId))
      .returning()

    return updated
  }

  async deleteLesson(userId: string, lessonId: string) {
    const lesson = await this.getLesson(lessonId)

    const [moduleRow] = await this.db
      .select({ courseId: modules.courseId })
      .from(modules)
      .where(eq(modules.id, lesson.moduleId))

    if (!moduleRow) {
      throw Object.assign(new Error('Module not found'), { statusCode: 404 })
    }

    await this.assertCanEdit(userId, moduleRow.courseId)

    await this.db.delete(lessonContent).where(eq(lessonContent.lessonId, lessonId))
    await this.db.delete(lessons).where(eq(lessons.id, lessonId))
  }

  async saveLessonContent(userId: string, lessonId: string, input: SaveLessonContentInput) {
    const lesson = await this.getLesson(lessonId)

    const [moduleRow] = await this.db
      .select({ courseId: modules.courseId })
      .from(modules)
      .where(eq(modules.id, lesson.moduleId))

    if (!moduleRow) {
      throw Object.assign(new Error('Module not found'), { statusCode: 404 })
    }

    await this.assertCanEdit(userId, moduleRow.courseId)

    // Upsert lesson content
    const [existing] = await this.db
      .select({ id: lessonContent.id })
      .from(lessonContent)
      .where(eq(lessonContent.lessonId, lessonId))

    if (existing) {
      const [updated] = await this.db
        .update(lessonContent)
        .set({ payload: input.payload, updatedAt: new Date() })
        .where(eq(lessonContent.lessonId, lessonId))
        .returning()
      return updated
    } else {
      const [created] = await this.db
        .insert(lessonContent)
        .values({ lessonId, payload: input.payload })
        .returning()
      return created
    }
  }

  async reorderLessons(userId: string, items: ReorderInput) {
    for (const item of items) {
      const [lessonRow] = await this.db
        .select({ moduleId: lessons.moduleId })
        .from(lessons)
        .where(eq(lessons.id, item.id))

      if (lessonRow) {
        const [moduleRow] = await this.db
          .select({ courseId: modules.courseId })
          .from(modules)
          .where(eq(modules.id, lessonRow.moduleId))

        if (moduleRow) {
          await this.assertCanEdit(userId, moduleRow.courseId)
          await this.db
            .update(lessons)
            .set({ order: item.order })
            .where(eq(lessons.id, item.id))
        }
      }
    }
  }
}
