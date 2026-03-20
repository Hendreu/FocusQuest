// XPService.ts — award XP, track history, emit events
import { EventEmitter } from 'events'
import type { XPEvent } from '@repo/types'

export type XPSourceType =
  | 'lesson_complete'
  | 'streak_bonus'
  | 'badge_earned'
  | 'quest_complete'
  | 'daily_login'

// Minimal DB interface — the actual db (drizzle instance) is injected from apps/api
// We use unknown and cast in implementation to avoid circular dependency
export type AnyDB = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insert: (table: any) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select: () => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (table: any) => any
}

export class XPService {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly db: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly schema: any,
    private readonly emitter: EventEmitter,
    private readonly levelService: {
      addXP: (
        userId: string,
        amount: number,
      ) => Promise<{ leveledUp: boolean; newLevel: number; currentXp: number }>
    },
  ) {}

  async award(
    userId: string,
    source: XPSourceType,
    xpAmount: number,
    sourceId?: string,
  ): Promise<XPEvent> {
    const [event] = await this.db
      .insert(this.schema.xpEvents)
      .values({
        userId,
        sourceType: source,
        sourceId: sourceId ?? null,
        xpAmount,
      })
      .returning()

    const { currentXp, leveledUp, newLevel } =
      await this.levelService.addXP(userId, xpAmount)

    this.emitter.emit('xp.awarded', {
      userId,
      xpAmount,
      newTotal: currentXp,
      leveledUp,
      newLevel,
    })

    return {
      id: event.id,
      userId: event.userId,
      sourceType: event.sourceType,
      sourceId: event.sourceId,
      xpAmount: event.xpAmount,
      createdAt: event.createdAt.toISOString(),
    }
  }

  async getTotal(userId: string): Promise<number> {
    const { eq, sum } = await import('drizzle-orm')
    const result = await this.db
      .select({ total: sum(this.schema.xpEvents.xpAmount) })
      .from(this.schema.xpEvents)
      .where(eq(this.schema.xpEvents.userId, userId))
    const raw = result[0]?.total
    return raw ? Number(raw) : 0
  }

  async getHistory(userId: string, limit = 20): Promise<XPEvent[]> {
    const { eq, desc } = await import('drizzle-orm')
    const rows = await this.db
      .select()
      .from(this.schema.xpEvents)
      .where(eq(this.schema.xpEvents.userId, userId))
      .orderBy(desc(this.schema.xpEvents.createdAt))
      .limit(limit)

    return rows.map(
      (r: {
        id: string
        userId: string
        sourceType: XPSourceType
        sourceId: string | null
        xpAmount: number
        createdAt: Date
      }) => ({
        id: r.id,
        userId: r.userId,
        sourceType: r.sourceType,
        sourceId: r.sourceId,
        xpAmount: r.xpAmount,
        createdAt: r.createdAt.toISOString(),
      }),
    )
  }
}
