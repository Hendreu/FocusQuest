// institution.service.ts — Business logic for institution management
import jwt from 'jsonwebtoken'
import { eq, and, isNotNull, gt, count, inArray } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type * as schema from '../../db/schema'
import {
  institutions,
  institutionMembers,
  users,
  streaks,
  userBadges,
  userLevels,
} from '../../db/schema'
import type {
  CreateInstitutionInput,
  UpdateInstitutionInput,
  GenerateInviteInput,
  InstitutionStats,
} from './institution.schema'

type DB = PostgresJsDatabase<typeof schema>

const INVITE_SECRET =
  process.env.INVITE_SECRET ?? process.env.JWT_SECRET ?? 'invite-secret-change-me'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

function makeError(message: string, statusCode: number, code: string, extra?: Record<string, unknown>) {
  const err = Object.assign(new Error(message), { statusCode, code, ...extra })
  return err
}

export class InstitutionService {
  constructor(private readonly db: DB) {}

  // ---------------------------------------------------------------------------
  // Create institution
  // ---------------------------------------------------------------------------
  async create(creatorId: string, data: CreateInstitutionInput) {
    // 1. Check slug uniqueness
    const [existing] = await this.db
      .select({ id: institutions.id })
      .from(institutions)
      .where(eq(institutions.slug, data.slug))
      .limit(1)

    if (existing) {
      throw makeError('Slug already in use', 409, 'SLUG_CONFLICT')
    }

    // 2. Insert institution
    const [institution] = await this.db
      .insert(institutions)
      .values({
        name: data.name,
        slug: data.slug,
        licenseSeats: data.license_seats,
      })
      .returning()

    // 3. Add creator as admin member (joinedAt = now)
    await this.db.insert(institutionMembers).values({
      institutionId: institution.id,
      userId: creatorId,
      role: 'admin',
      joinedAt: new Date(),
    })

    return institution
  }

  // ---------------------------------------------------------------------------
  // Get by id
  // ---------------------------------------------------------------------------
  async getById(institutionId: string) {
    const [institution] = await this.db
      .select()
      .from(institutions)
      .where(eq(institutions.id, institutionId))
      .limit(1)

    if (!institution) {
      throw makeError('Institution not found', 404, 'NOT_FOUND')
    }

    return institution
  }

  // ---------------------------------------------------------------------------
  // Update institution
  // ---------------------------------------------------------------------------
  async update(institutionId: string, data: UpdateInstitutionInput) {
    if (data.slug) {
      const [existing] = await this.db
        .select({ id: institutions.id })
        .from(institutions)
        .where(eq(institutions.slug, data.slug))
        .limit(1)

      if (existing && existing.id !== institutionId) {
        throw makeError('Slug already in use', 409, 'SLUG_CONFLICT')
      }
    }

    const [updated] = await this.db
      .update(institutions)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
      })
      .where(eq(institutions.id, institutionId))
      .returning()

    if (!updated) {
      throw makeError('Institution not found', 404, 'NOT_FOUND')
    }

    return updated
  }

  // ---------------------------------------------------------------------------
  // Generate invite
  // ---------------------------------------------------------------------------
  async generateInvite(adminId: string, institutionId: string, input: GenerateInviteInput) {
    await this.assertIsAdmin(adminId, institutionId)

    const [institution] = await this.db
      .select({ licenseSeats: institutions.licenseSeats })
      .from(institutions)
      .where(eq(institutions.id, institutionId))
      .limit(1)

    if (!institution) {
      throw makeError('Institution not found', 404, 'NOT_FOUND')
    }

    // Count active members (joinedAt IS NOT NULL)
    const [{ value: seatsUsed }] = await this.db
      .select({ value: count() })
      .from(institutionMembers)
      .where(
        and(
          eq(institutionMembers.institutionId, institutionId),
          isNotNull(institutionMembers.joinedAt),
        ),
      )

    if (seatsUsed >= institution.licenseSeats) {
      throw makeError('License seats exceeded', 402, 'LICENSE_SEATS_EXCEEDED', {
        seats_used: seatsUsed,
        limit: institution.licenseSeats,
      })
    }

    const payload: Record<string, unknown> = {
      institution_id: institutionId,
      role: input.role,
    }
    if (input.class_id) payload.class_id = input.class_id

    const token = jwt.sign(payload, INVITE_SECRET, { expiresIn: '7d' })
    const invite_url = `${APP_URL}/invite?token=${token}`

    const now = Date.now()
    const expires_at = new Date(now + 7 * 24 * 60 * 60 * 1000)

    return { invite_url, token, expires_at }
  }

  // ---------------------------------------------------------------------------
  // Accept invite
  // ---------------------------------------------------------------------------
  async acceptInvite(userId: string, token: string) {
    let payload: { institution_id: string; role: 'student'; class_id?: string }
    try {
      payload = jwt.verify(token, INVITE_SECRET) as typeof payload
    } catch {
      throw makeError('Invite token is invalid or expired', 401, 'INVALID_INVITE_TOKEN')
    }

    const { institution_id } = payload

    // Check already a member
    const [existing] = await this.db
      .select({ id: institutionMembers.id })
      .from(institutionMembers)
      .where(
        and(
          eq(institutionMembers.institutionId, institution_id),
          eq(institutionMembers.userId, userId),
          isNotNull(institutionMembers.joinedAt),
        ),
      )
      .limit(1)

    if (existing) {
      throw makeError('User is already a member of this institution', 409, 'ALREADY_MEMBER')
    }

    // Revalidate seats (race condition protection)
    const [institution] = await this.db
      .select({ licenseSeats: institutions.licenseSeats, name: institutions.name })
      .from(institutions)
      .where(eq(institutions.id, institution_id))
      .limit(1)

    if (!institution) {
      throw makeError('Institution not found', 404, 'NOT_FOUND')
    }

    const [{ value: seatsUsed }] = await this.db
      .select({ value: count() })
      .from(institutionMembers)
      .where(
        and(
          eq(institutionMembers.institutionId, institution_id),
          isNotNull(institutionMembers.joinedAt),
        ),
      )

    if (seatsUsed >= institution.licenseSeats) {
      throw makeError('License seats exceeded', 402, 'LICENSE_SEATS_EXCEEDED', {
        seats_used: seatsUsed,
        limit: institution.licenseSeats,
      })
    }

    const [member] = await this.db
      .insert(institutionMembers)
      .values({
        institutionId: institution_id,
        userId,
        role: payload.role,
        joinedAt: new Date(),
        inviteToken: token,
      })
      .returning()

    import('../notifications/notifications.service').then(({ notificationsService }) => {
      notificationsService.create(userId, 'institution_invite', { institution_name: institution.name, invite_token: token }).catch(console.error)
    })

    return member
  }

  // ---------------------------------------------------------------------------
  // List members
  // ---------------------------------------------------------------------------
  async listMembers(institutionId: string, page = 1) {
    const pageSize = 20
    const offset = (page - 1) * pageSize

    const rows = await this.db
      .select({
        id: institutionMembers.id,
        userId: institutionMembers.userId,
        role: institutionMembers.role,
        joinedAt: institutionMembers.joinedAt,
        name: users.name,
        email: users.email,
      })
      .from(institutionMembers)
      .innerJoin(users, eq(institutionMembers.userId, users.id))
      .where(
        and(
          eq(institutionMembers.institutionId, institutionId),
          isNotNull(institutionMembers.joinedAt),
        ),
      )
      .limit(pageSize)
      .offset(offset)

    return { members: rows, page, page_size: pageSize }
  }

  // ---------------------------------------------------------------------------
  // Remove member (DELETE row — no left_at in schema)
  // ---------------------------------------------------------------------------
  async removeMember(adminId: string, institutionId: string, targetUserId: string) {
    await this.assertIsAdmin(adminId, institutionId)

    await this.db
      .delete(institutionMembers)
      .where(
        and(
          eq(institutionMembers.institutionId, institutionId),
          eq(institutionMembers.userId, targetUserId),
        ),
      )
  }

  // ---------------------------------------------------------------------------
  // Get stats
  // ---------------------------------------------------------------------------
  async getStats(institutionId: string): Promise<InstitutionStats> {
    const [institution] = await this.db
      .select({ licenseSeats: institutions.licenseSeats })
      .from(institutions)
      .where(eq(institutions.id, institutionId))
      .limit(1)

    if (!institution) {
      throw makeError('Institution not found', 404, 'NOT_FOUND')
    }

    // Active students
    const [{ value: activeStudents }] = await this.db
      .select({ value: count() })
      .from(institutionMembers)
      .where(
        and(
          eq(institutionMembers.institutionId, institutionId),
          isNotNull(institutionMembers.joinedAt),
        ),
      )

    const memberRows = await this.db
      .select({ userId: institutionMembers.userId })
      .from(institutionMembers)
      .where(
        and(
          eq(institutionMembers.institutionId, institutionId),
          isNotNull(institutionMembers.joinedAt),
        ),
      )

    const userIdList = memberRows.map((m) => m.userId)

    let activeStreaksCount = 0
    let badgesEarnedThisWeek = 0
    let topStudents: InstitutionStats['top_students'] = []

    if (userIdList.length > 0) {
      // Active streaks
      const [{ value: streakCount }] = await this.db
        .select({ value: count() })
        .from(streaks)
        .where(and(inArray(streaks.userId, userIdList), gt(streaks.currentStreak, 0)))

      activeStreaksCount = streakCount

      // Badges earned this week
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const [{ value: badgeCount }] = await this.db
        .select({ value: count() })
        .from(userBadges)
        .where(
          and(inArray(userBadges.userId, userIdList), gt(userBadges.earnedAt, oneWeekAgo)),
        )

      badgesEarnedThisWeek = badgeCount

      // Top 5 students by XP
      const levelRows = await this.db
        .select({
          userId: userLevels.userId,
          currentXp: userLevels.currentXp,
          level: userLevels.level,
          name: users.name,
        })
        .from(userLevels)
        .innerJoin(users, eq(userLevels.userId, users.id))
        .where(inArray(userLevels.userId, userIdList))
        .orderBy(userLevels.currentXp)
        .limit(5)

      topStudents = levelRows.map((r) => ({
        user_id: r.userId,
        name: r.name,
        xp: r.currentXp,
        level: r.level,
      }))
    }

    return {
      active_students: activeStudents,
      seats_used: activeStudents,
      seats_total: institution.licenseSeats,
      avg_progress_percent: 0, // requires joins across user_progress; simplified for MVP
      active_streaks_count: activeStreaksCount,
      badges_earned_this_week: badgesEarnedThisWeek,
      top_students: topStudents,
    }
  }

  // ---------------------------------------------------------------------------
  // Assert admin (throws 403 if not)
  // ---------------------------------------------------------------------------
  async assertIsAdmin(userId: string, institutionId: string) {
    const [member] = await this.db
      .select({ role: institutionMembers.role })
      .from(institutionMembers)
      .where(
        and(
          eq(institutionMembers.institutionId, institutionId),
          eq(institutionMembers.userId, userId),
          isNotNull(institutionMembers.joinedAt),
        ),
      )
      .limit(1)

    if (!member || member.role !== 'admin') {
      throw makeError('Forbidden: institution admin required', 403, 'FORBIDDEN')
    }
  }
}
