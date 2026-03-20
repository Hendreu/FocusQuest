// content.controller.ts — Thin HTTP handler layer for content module
import type { FastifyRequest, FastifyReply } from 'fastify'
import type { ContentService } from './content.service'
import type { UploadService } from './upload.service'
import {
  createCourseSchema,
  updateCourseSchema,
  courseStatusSchema,
  createModuleSchema,
  updateModuleSchema,
  reorderSchema,
  createLessonSchema,
  updateLessonSchema,
  saveLessonContentSchema,
} from './content.schema'

type ServiceError = Error & {
  statusCode?: number
  code?: string
  lesson_id?: string
  course_id?: string
  limit?: number
}

function sendError(reply: FastifyReply, err: unknown) {
  const e = err as ServiceError
  const statusCode = e.statusCode ?? 500
  return reply.status(statusCode).send({
    error: e.message,
    code: e.code ?? 'INTERNAL_ERROR',
    ...(e.lesson_id !== undefined && { lesson_id: e.lesson_id }),
    ...(e.course_id !== undefined && { course_id: e.course_id }),
    ...(e.limit !== undefined && { limit: e.limit }),
  })
}

export function buildContentController(service: ContentService, uploadService: UploadService) {
  return {
    // -----------------------------------------------------------------------
    // Courses
    // -----------------------------------------------------------------------

    async createCourse(req: FastifyRequest, reply: FastifyReply) {
      const parsed = createCourseSchema.safeParse(req.body)
      if (!parsed.success) return reply.status(400).send({ error: 'Validation error', issues: parsed.error.issues })
      try {
        const course = await service.createCourse(req.user.id, parsed.data)
        return reply.status(201).send(course)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async listCourses(req: FastifyRequest<{ Querystring: { lang?: string; search?: string; page?: string } }>, reply: FastifyReply) {
      try {
        const { lang, search, page } = req.query
        const result = await service.listCourses({
          lang,
          search,
          page: page ? parseInt(page, 10) : 1,
        })
        return reply.send(result)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async getCourse(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      try {
        const course = await service.getCourse(req.params.id)
        return reply.send(course)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async getCurriculum(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      try {
        const userId = req.user?.id
        const curriculum = await service.getCurriculum(req.params.id, userId)
        return reply.send(curriculum)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async updateCourse(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const parsed = updateCourseSchema.safeParse(req.body)
      if (!parsed.success) return reply.status(400).send({ error: 'Validation error', issues: parsed.error.issues })
      try {
        const course = await service.updateCourse(req.user.id, req.params.id, parsed.data)
        return reply.send(course)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async deleteCourse(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      try {
        await service.deleteCourse(req.params.id)
        return reply.status(204).send()
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async updateCourseStatus(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const parsed = courseStatusSchema.safeParse(req.body)
      if (!parsed.success) return reply.status(400).send({ error: 'Validation error', issues: parsed.error.issues })
      try {
        const course = await service.updateCourseStatus(req.user.id, req.params.id, parsed.data)
        return reply.send(course)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    // -----------------------------------------------------------------------
    // Modules
    // -----------------------------------------------------------------------

    async createModule(req: FastifyRequest<{ Params: { courseId: string } }>, reply: FastifyReply) {
      const parsed = createModuleSchema.safeParse(req.body)
      if (!parsed.success) return reply.status(400).send({ error: 'Validation error', issues: parsed.error.issues })
      try {
        const module = await service.createModule(req.user.id, req.params.courseId, parsed.data)
        return reply.status(201).send(module)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async listModules(req: FastifyRequest<{ Params: { courseId: string } }>, reply: FastifyReply) {
      try {
        const mods = await service.listModules(req.params.courseId)
        return reply.send(mods)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async updateModule(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const parsed = updateModuleSchema.safeParse(req.body)
      if (!parsed.success) return reply.status(400).send({ error: 'Validation error', issues: parsed.error.issues })
      try {
        const mod = await service.updateModule(req.user.id, req.params.id, parsed.data)
        return reply.send(mod)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async deleteModule(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      try {
        await service.deleteModule(req.user.id, req.params.id)
        return reply.status(204).send()
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async reorderModules(req: FastifyRequest, reply: FastifyReply) {
      const parsed = reorderSchema.safeParse(req.body)
      if (!parsed.success) return reply.status(400).send({ error: 'Validation error', issues: parsed.error.issues })
      try {
        await service.reorderModules(req.user.id, parsed.data)
        return reply.status(204).send()
      } catch (err) {
        return sendError(reply, err)
      }
    },

    // -----------------------------------------------------------------------
    // Lessons
    // -----------------------------------------------------------------------

    async createLesson(req: FastifyRequest<{ Params: { moduleId: string } }>, reply: FastifyReply) {
      const parsed = createLessonSchema.safeParse(req.body)
      if (!parsed.success) return reply.status(400).send({ error: 'Validation error', issues: parsed.error.issues })
      try {
        const lesson = await service.createLesson(req.user.id, req.params.moduleId, parsed.data)
        return reply.status(201).send(lesson)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async getLesson(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      try {
        const userId = req.user?.id
        const lesson = await service.getLessonWithContent(req.params.id, userId)
        return reply.send(lesson)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async getLessonContent(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      try {
        const result = await service.getLessonContent(req.params.id, req.user.id)
        return reply.send(result)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async updateLesson(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const parsed = updateLessonSchema.safeParse(req.body)
      if (!parsed.success) return reply.status(400).send({ error: 'Validation error', issues: parsed.error.issues })
      try {
        const lesson = await service.updateLesson(req.user.id, req.params.id, parsed.data)
        return reply.send(lesson)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async deleteLesson(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      try {
        await service.deleteLesson(req.user.id, req.params.id)
        return reply.status(204).send()
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async saveLessonContent(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const parsed = saveLessonContentSchema.safeParse(req.body)
      if (!parsed.success) return reply.status(400).send({ error: 'Validation error', issues: parsed.error.issues })
      try {
        const content = await service.saveLessonContent(req.user.id, req.params.id, parsed.data)
        return reply.status(200).send(content)
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async reorderLessons(req: FastifyRequest, reply: FastifyReply) {
      const parsed = reorderSchema.safeParse(req.body)
      if (!parsed.success) return reply.status(400).send({ error: 'Validation error', issues: parsed.error.issues })
      try {
        await service.reorderLessons(req.user.id, parsed.data)
        return reply.status(204).send()
      } catch (err) {
        return sendError(reply, err)
      }
    },

    // -----------------------------------------------------------------------
    // Upload
    // -----------------------------------------------------------------------

    async uploadVideo(req: FastifyRequest, reply: FastifyReply) {
      try {
        // @fastify/multipart - get the file field
        const data = await (req as FastifyRequest & { file: () => Promise<{ filename: string; mimetype: string; file: import('stream').Readable } | null> }).file()
        if (!data) return reply.status(400).send({ error: 'No file uploaded' })

        const url = await uploadService.uploadVideo(data)
        return reply.status(200).send({ url })
      } catch (err) {
        return sendError(reply, err)
      }
    },

    async uploadImage(req: FastifyRequest, reply: FastifyReply) {
      try {
        const data = await (req as FastifyRequest & { file: () => Promise<{ filename: string; mimetype: string; file: import('stream').Readable } | null> }).file()
        if (!data) return reply.status(400).send({ error: 'No file uploaded' })

        const url = await uploadService.uploadImage(data)
        return reply.status(200).send({ url })
      } catch (err) {
        return sendError(reply, err)
      }
    },
  }
}
