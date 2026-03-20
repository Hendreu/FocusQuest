// LeaderboardService.ts — global, weekly, and institution leaderboards
import type { LeaderboardEntry } from '@repo/types'
import type { PaginatedResponse } from '@repo/types'

export class LeaderboardService {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly db: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly schema: any,
  ) {}

  async getGlobal(
    page = 1,
    pageSize = 100,
  ): Promise<PaginatedResponse<LeaderboardEntry>> {
    const { desc, eq } = await import('drizzle-orm')
    const offset = (page - 1) * pageSize

    const rows = await this.db
      .select({
        userId: this.schema.userLevels.userId,
        level: this.schema.userLevels.level,
        currentXp: this.schema.userLevels.currentXp,
        userName: this.schema.users.name,
        currentStreak: this.schema.streaks.currentStreak,
        avatarBaseCharacter: this.schema.avatars.baseCharacter,
      })
      .from(this.schema.userLevels)
      .leftJoin(
        this.schema.users,
        eq(this.schema.userLevels.userId, this.schema.users.id),
      )
      .leftJoin(
        this.schema.streaks,
        eq(this.schema.userLevels.userId, this.schema.streaks.userId),
      )
      .leftJoin(
        this.schema.avatars,
        eq(this.schema.userLevels.userId, this.schema.avatars.userId),
      )
      .orderBy(
        desc(this.schema.userLevels.currentXp),
        desc(this.schema.userLevels.level),
      )
      .limit(pageSize)
      .offset(offset)

    const data: LeaderboardEntry[] = rows.map(
      (
        r: {
          userId: string
          level: number
          currentXp: number
          userName: string | null
          currentStreak: number | null
          avatarBaseCharacter: string | null
        },
        idx: number,
      ) => ({
        rank: offset + idx + 1,
        userId: r.userId,
        userName: r.userName ?? 'Unknown',
        avatarBaseCharacter: r.avatarBaseCharacter ?? 'character-1',
        level: r.level,
        currentXp: r.currentXp,
        currentStreak: r.currentStreak ?? 0,
      }),
    )

    return {
      data,
      page,
      pageSize,
      total: data.length, // simplified — full count query omitted for performance
      totalPages: Math.ceil(data.length / pageSize),
    }
  }

  async getWeekly(
    page = 1,
    pageSize = 100,
  ): Promise<PaginatedResponse<LeaderboardEntry>> {
    const { desc, eq, gte, sum } = await import('drizzle-orm')
    const offset = (page - 1) * pageSize
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    // Aggregate XP earned this week
    const rows = await this.db
      .select({
        userId: this.schema.xpEvents.userId,
        weeklyXp: sum(this.schema.xpEvents.xpAmount),
        userName: this.schema.users.name,
        level: this.schema.userLevels.level,
        currentStreak: this.schema.streaks.currentStreak,
        avatarBaseCharacter: this.schema.avatars.baseCharacter,
      })
      .from(this.schema.xpEvents)
      .leftJoin(
        this.schema.users,
        eq(this.schema.xpEvents.userId, this.schema.users.id),
      )
      .leftJoin(
        this.schema.userLevels,
        eq(this.schema.xpEvents.userId, this.schema.userLevels.userId),
      )
      .leftJoin(
        this.schema.streaks,
        eq(this.schema.xpEvents.userId, this.schema.streaks.userId),
      )
      .leftJoin(
        this.schema.avatars,
        eq(this.schema.xpEvents.userId, this.schema.avatars.userId),
      )
      .where(gte(this.schema.xpEvents.createdAt, weekAgo))
      .groupBy(
        this.schema.xpEvents.userId,
        this.schema.users.name,
        this.schema.userLevels.level,
        this.schema.streaks.currentStreak,
        this.schema.avatars.baseCharacter,
      )
      .orderBy(desc(sum(this.schema.xpEvents.xpAmount)))
      .limit(pageSize)
      .offset(offset)

    const data: LeaderboardEntry[] = rows.map(
      (
        r: {
          userId: string
          weeklyXp: string | null
          userName: string | null
          level: number | null
          currentStreak: number | null
          avatarBaseCharacter: string | null
        },
        idx: number,
      ) => ({
        rank: offset + idx + 1,
        userId: r.userId,
        userName: r.userName ?? 'Unknown',
        avatarBaseCharacter: r.avatarBaseCharacter ?? 'character-1',
        level: r.level ?? 1,
        currentXp: Number(r.weeklyXp ?? 0),
        currentStreak: r.currentStreak ?? 0,
      }),
    )

    return {
      data,
      page,
      pageSize,
      total: data.length,
      totalPages: Math.ceil(data.length / pageSize),
    }
  }

  async getInstitution(institutionId: string): Promise<LeaderboardEntry[]> {
    const { desc, eq } = await import('drizzle-orm')

    const rows = await this.db
      .select({
        userId: this.schema.institutionMembers.userId,
        level: this.schema.userLevels.level,
        currentXp: this.schema.userLevels.currentXp,
        userName: this.schema.users.name,
        currentStreak: this.schema.streaks.currentStreak,
        avatarBaseCharacter: this.schema.avatars.baseCharacter,
      })
      .from(this.schema.institutionMembers)
      .leftJoin(
        this.schema.userLevels,
        eq(
          this.schema.institutionMembers.userId,
          this.schema.userLevels.userId,
        ),
      )
      .leftJoin(
        this.schema.users,
        eq(this.schema.institutionMembers.userId, this.schema.users.id),
      )
      .leftJoin(
        this.schema.streaks,
        eq(this.schema.institutionMembers.userId, this.schema.streaks.userId),
      )
      .leftJoin(
        this.schema.avatars,
        eq(this.schema.institutionMembers.userId, this.schema.avatars.userId),
      )
      .where(
        eq(
          this.schema.institutionMembers.institutionId,
          institutionId,
        ),
      )
      .orderBy(
        desc(this.schema.userLevels.currentXp),
        desc(this.schema.userLevels.level),
      )
      .limit(100)

    return rows.map(
      (
        r: {
          userId: string
          level: number | null
          currentXp: number | null
          userName: string | null
          currentStreak: number | null
          avatarBaseCharacter: string | null
        },
        idx: number,
      ) => ({
        rank: idx + 1,
        userId: r.userId,
        userName: r.userName ?? 'Unknown',
        avatarBaseCharacter: r.avatarBaseCharacter ?? 'character-1',
        level: r.level ?? 1,
        currentXp: r.currentXp ?? 0,
        currentStreak: r.currentStreak ?? 0,
      }),
    )
  }

  async getUserRank(userId: string): Promise<number> {
    const { desc, gt, sql } = await import('drizzle-orm')

    // Count users with more XP than this user
    const userLevel = await this.db
      .select({ currentXp: this.schema.userLevels.currentXp })
      .from(this.schema.userLevels)
      .where(sql`${this.schema.userLevels.userId} = ${userId}`)
      .limit(1)

    if (userLevel.length === 0) return 0

    const userXp = userLevel[0].currentXp

    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(this.schema.userLevels)
      .where(gt(this.schema.userLevels.currentXp, userXp))

    return (result[0]?.count ?? 0) + 1
  }
}
