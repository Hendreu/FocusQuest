// LevelService.ts — manage user levels, detect level-ups
import { EventEmitter } from 'events'
import { LEVEL_TABLE } from '../constants/levels'
import type { LevelDefinition } from '@repo/types'
import type { UserLevel } from '@repo/types'

export class LevelService {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly db: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly schema: any,
    private readonly emitter: EventEmitter,
  ) {}

  getLevelForXP(totalXP: number): LevelDefinition {
    // Find highest level whose xpRequired <= totalXP
    let current = LEVEL_TABLE[0]!
    for (const def of LEVEL_TABLE) {
      if (def.xpRequired <= totalXP) {
        current = def
      } else {
        break
      }
    }
    return current
  }

  async addXP(
    userId: string,
    amount: number,
  ): Promise<{ leveledUp: boolean; newLevel: number; currentXp: number }> {
    const { eq } = await import('drizzle-orm')

    // Upsert user_levels — increment currentXp
    const existing = await this.db
      .select()
      .from(this.schema.userLevels)
      .where(eq(this.schema.userLevels.userId, userId))
      .limit(1)

    let currentXp: number
    let oldLevel: number

    if (existing.length === 0) {
      // Create row
      await this.db.insert(this.schema.userLevels).values({
        userId,
        currentXp: amount,
        level: 1,
      })
      currentXp = amount
      oldLevel = 1
    } else {
      currentXp = existing[0].currentXp + amount
      oldLevel = existing[0].level
      await this.db
        .update(this.schema.userLevels)
        .set({ currentXp, updatedAt: new Date() })
        .where(eq(this.schema.userLevels.userId, userId))
    }

    const newLevelDef = this.getLevelForXP(currentXp)
    const newLevel = newLevelDef.level
    const leveledUp = newLevel > oldLevel

    if (leveledUp) {
      await this.db
        .update(this.schema.userLevels)
        .set({ level: newLevel, updatedAt: new Date() })
        .where(eq(this.schema.userLevels.userId, userId))

      this.emitter.emit('level.up', { userId, oldLevel, newLevel })
    }

    return { leveledUp, newLevel, currentXp }
  }

  async getProfile(userId: string): Promise<UserLevel> {
    const { eq } = await import('drizzle-orm')
    const rows = await this.db
      .select()
      .from(this.schema.userLevels)
      .where(eq(this.schema.userLevels.userId, userId))
      .limit(1)

    if (rows.length === 0) {
      return {
        userId,
        currentXp: 0,
        level: 1,
        updatedAt: new Date().toISOString(),
      }
    }

    const r = rows[0]
    return {
      userId: r.userId,
      currentXp: r.currentXp,
      level: r.level,
      updatedAt: r.updatedAt.toISOString(),
    }
  }
}
