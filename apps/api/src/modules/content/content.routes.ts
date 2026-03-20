// content.routes.ts — Fastify plugin registering all content routes
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import multipart from '@fastify/multipart'
import { db } from '../../db/index'
import { authMiddleware } from '../auth/auth.middleware'
import { ContentService } from './content.service'
import { UploadService } from './upload.service'
import { buildContentController } from './content.controller'

const contentService = new ContentService(db)
const uploadService = new UploadService()
const ctrl = buildContentController(contentService, uploadService)

// Role guard factory
function requireRole(roles: string[]) {
  return async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    await authMiddleware(req, reply)
    if (reply.sent) return
    if (!roles.includes(req.user.role)) {
      reply.code(403).send({ error: 'Forbidden', code: 'INSUFFICIENT_ROLE' })
    }
  }
}

const creatorOrAdmin = requireRole(['creator', 'institution_admin', 'super_admin'])
const adminOnly = requireRole(['institution_admin', 'super_admin'])

export const contentRoutes = fp(
  async (fastify: FastifyInstance) => {
    // Register multipart for file uploads
    await fastify.register(multipart, { limits: { fileSize: 500 * 1024 * 1024 } })

    // -----------------------------------------------------------------------
    // Courses
    // -----------------------------------------------------------------------

    fastify.post('/courses', { preHandler: creatorOrAdmin }, ctrl.createCourse)

    fastify.get<{ Querystring: { lang?: string; search?: string; page?: string } }>(
      '/courses',
      ctrl.listCourses,
    )

    fastify.get<{ Params: { id: string } }>('/courses/:id', ctrl.getCourse)

    fastify.get<{ Params: { id: string } }>(
      '/courses/:id/curriculum',
      // curriculum is public but can include user progress if authenticated — try auth, don't fail if missing
      {
        preHandler: async (req: FastifyRequest, reply: FastifyReply) => {
          try {
            await req.jwtVerify()
          } catch {
            // Not authenticated — still serve public curriculum
          }
        },
      },
      ctrl.getCurriculum,
    )

    fastify.patch<{ Params: { id: string } }>(
      '/courses/:id',
      { preHandler: creatorOrAdmin },
      ctrl.updateCourse,
    )

    fastify.delete<{ Params: { id: string } }>(
      '/courses/:id',
      { preHandler: adminOnly },
      ctrl.deleteCourse,
    )

    fastify.patch<{ Params: { id: string } }>(
      '/courses/:id/status',
      { preHandler: creatorOrAdmin },
      ctrl.updateCourseStatus,
    )

    // -----------------------------------------------------------------------
    // Modules
    // -----------------------------------------------------------------------

    fastify.post<{ Params: { courseId: string } }>(
      '/courses/:courseId/modules',
      { preHandler: creatorOrAdmin },
      ctrl.createModule,
    )

    fastify.get<{ Params: { courseId: string } }>(
      '/courses/:courseId/modules',
      ctrl.listModules,
    )

    fastify.patch<{ Params: { id: string } }>(
      '/modules/:id',
      { preHandler: creatorOrAdmin },
      ctrl.updateModule,
    )

    fastify.delete<{ Params: { id: string } }>(
      '/modules/:id',
      { preHandler: creatorOrAdmin },
      ctrl.deleteModule,
    )

    fastify.post('/modules/reorder', { preHandler: creatorOrAdmin }, ctrl.reorderModules)

    // -----------------------------------------------------------------------
    // Lessons
    // -----------------------------------------------------------------------

    fastify.post<{ Params: { moduleId: string } }>(
      '/modules/:moduleId/lessons',
      { preHandler: creatorOrAdmin },
      ctrl.createLesson,
    )

    fastify.get<{ Params: { id: string } }>(
      '/lessons/:id',
      {
        preHandler: async (req: FastifyRequest, reply: FastifyReply) => {
          try {
            await req.jwtVerify()
          } catch {
            // Optional auth
          }
        },
      },
      ctrl.getLesson,
    )

    fastify.get<{ Params: { id: string } }>(
      '/lessons/:id/content',
      { preHandler: authMiddleware },
      ctrl.getLessonContent,
    )

    fastify.patch<{ Params: { id: string } }>(
      '/lessons/:id',
      { preHandler: creatorOrAdmin },
      ctrl.updateLesson,
    )

    fastify.delete<{ Params: { id: string } }>(
      '/lessons/:id',
      { preHandler: creatorOrAdmin },
      ctrl.deleteLesson,
    )

    fastify.post<{ Params: { id: string } }>(
      '/lessons/:id/content',
      { preHandler: creatorOrAdmin },
      ctrl.saveLessonContent,
    )

    fastify.post('/lessons/reorder', { preHandler: creatorOrAdmin }, ctrl.reorderLessons)

    // -----------------------------------------------------------------------
    // Upload
    // -----------------------------------------------------------------------

    fastify.post(
      '/upload/video',
      { preHandler: creatorOrAdmin },
      ctrl.uploadVideo,
    )

    fastify.post(
      '/upload/image',
      { preHandler: creatorOrAdmin },
      ctrl.uploadImage,
    )
  },
  { name: 'content-routes' },
)
