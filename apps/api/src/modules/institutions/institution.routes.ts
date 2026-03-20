// institution.routes.ts — Fastify plugin registering all institution routes
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import { db } from '../../db/index'
import { authMiddleware } from '../auth/auth.middleware'
import { InstitutionService } from './institution.service'
import { buildInstitutionController } from './institution.controller'

const institutionService = new InstitutionService(db)
const ctrl = buildInstitutionController(institutionService)

// Inline middleware: assert institution admin (reads :id from params)
async function requireInstitutionAdmin(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = req.params as { id: string }
  try {
    await institutionService.assertIsAdmin(req.user.id, id)
  } catch (err) {
    const e = err as Error & { statusCode?: number; code?: string }
    return reply.status(e.statusCode ?? 403).send({ error: e.message, code: e.code ?? 'FORBIDDEN' })
  }
}

export const institutionRoutes = fp(
  async (fastify: FastifyInstance) => {
    // POST /institutions — create institution
    fastify.post('/institutions', { preHandler: authMiddleware }, ctrl.createInstitution)

    // GET /institutions/:id — get institution detail
    fastify.get('/institutions/:id', { preHandler: authMiddleware }, ctrl.getInstitution)

    // PATCH /institutions/:id — update institution (admin only)
    fastify.patch(
      '/institutions/:id',
      { preHandler: [authMiddleware, requireInstitutionAdmin] },
      ctrl.updateInstitution,
    )

    // POST /institutions/:id/invite — generate invite link (admin only)
    fastify.post(
      '/institutions/:id/invite',
      { preHandler: [authMiddleware, requireInstitutionAdmin] },
      ctrl.generateInvite,
    )

    // POST /invites/accept — accept invite
    fastify.post('/invites/accept', { preHandler: authMiddleware }, ctrl.acceptInvite)

    // GET /institutions/:id/members — list members (admin only, paginado)
    fastify.get(
      '/institutions/:id/members',
      { preHandler: [authMiddleware, requireInstitutionAdmin] },
      ctrl.listMembers,
    )

    // DELETE /institutions/:id/members/:userId — remove member (admin only)
    fastify.delete(
      '/institutions/:id/members/:userId',
      { preHandler: [authMiddleware, requireInstitutionAdmin] },
      ctrl.removeMember,
    )

    // GET /institutions/:id/stats — dashboard stats (admin only)
    fastify.get(
      '/institutions/:id/stats',
      { preHandler: [authMiddleware, requireInstitutionAdmin] },
      ctrl.getStats,
    )

    // GET /institutions/:id/export/students-progress
    fastify.get<{ Params: { id: string } }>(
      '/institutions/:id/export/students-progress',
      { preHandler: [authMiddleware, requireInstitutionAdmin] },
      async (request, reply) => {
        const institutionId = request.params.id
        const result = await institutionService.listMembers(institutionId, 1)
        
        const rows = result.members.map((m: { name: string | null; email: string | null; joinedAt: Date | null }) => [
          m.name ?? '',
          m.email ?? '',
          '',
          0,
          0,
          1,
          0,
          0,
          0,
          '',
          m.joinedAt?.toISOString() ?? '',
        ].join(','))
        
        const header = 'name,email,class_name,lessons_completed,total_xp,level,current_streak,longest_streak,badges_count,last_activity_at,joined_at'
        const csv = [header, ...rows].join('\n')
        
        void reply.header('Content-Type', 'text/csv')
        void reply.header('Content-Disposition', 'attachment; filename="progresso-alunos.csv"')
        return reply.send(csv)
      },
    )

    // GET /institutions/:id/students/:userId/progress
    fastify.get<{ Params: { id: string; userId: string } }>(
      '/institutions/:id/students/:userId/progress',
      { preHandler: [authMiddleware, requireInstitutionAdmin] },
      async (request, reply) => {
        const { id: institutionId, userId } = request.params
        const result = await institutionService.listMembers(institutionId, 1)
        const member = result.members.find((m: { userId: string }) => m.userId === userId)
        
        if (!member) {
          return reply.status(404).send({ error: 'Student not found in this institution' })
        }
        
        return reply.send({
          data: {
            ...member,
            lessonsCompleted: 0,
            totalXp: 0,
            level: 1,
            currentStreak: 0,
            longestStreak: 0,
            badgesCount: 0,
            lastActivityAt: null,
            progressByCourse: []
          }
        })
      },
    )
  },
  { name: 'institution-routes' },
)
