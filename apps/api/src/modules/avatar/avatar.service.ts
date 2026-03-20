// avatar.service.ts — Business logic for avatar system
import { eq } from 'drizzle-orm'
import type { Database } from '../../db/index'
import { avatars, avatarItems, userCoins } from '../../db/schema'
import type { AvatarPayload, EquipInput, UnequipInput, BuyItemInput, SelectCharacterInput } from './avatar.schema'

type AvatarItemType = 'hat' | 'clothing' | 'accessory' | 'background'

function parsePayload(raw: unknown): AvatarPayload {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const p = raw as Record<string, unknown>
    return {
      equipped: Array.isArray(p['equipped']) ? p['equipped'] : [],
      owned: Array.isArray(p['owned']) ? (p['owned'] as string[]) : [],
    }
  }
  // Legacy: if stored as array, treat as empty
  return { equipped: [], owned: [] }
}

export class AvatarService {
  constructor(private db: Database) {}

  /**
   * Called right after user registration.
   * Creates avatar row with character-1 and 100 welcome coins.
   * (user_coins row is already created in auth.service — update balance to 100)
   */
  async createDefault(userId: string) {
    const payload: AvatarPayload = { equipped: [], owned: [] }

    const [avatar] = await this.db
      .insert(avatars)
      .values({
        userId,
        baseCharacter: 'character-1',
        equippedItems: payload,
      })
      .onConflictDoNothing()
      .returning()

    // Set 100 welcome coins (upsert since user_coins may already exist from auth.service)
    await this.db
      .insert(userCoins)
      .values({ userId, balance: 100 })
      .onConflictDoUpdate({
        target: userCoins.userId,
        set: { balance: 100 },
      })

    return avatar
  }

  async getAvatar(userId: string) {
    const [avatar] = await this.db
      .select()
      .from(avatars)
      .where(eq(avatars.userId, userId))

    if (!avatar) {
      throw Object.assign(new Error('Avatar not found'), { statusCode: 404, code: 'AVATAR_NOT_FOUND' })
    }

    const [coins] = await this.db
      .select({ balance: userCoins.balance })
      .from(userCoins)
      .where(eq(userCoins.userId, userId))

    const payload = parsePayload(avatar.equippedItems)

    // Resolve equipped items with full item data
    const equippedIds = payload.equipped.map((e) => e.id)
    let resolvedEquipped: (typeof avatarItems.$inferSelect)[] = []

    if (equippedIds.length > 0) {
      // Get full item data for equipped items
      resolvedEquipped = await this.db
        .select()
        .from(avatarItems)

      resolvedEquipped = resolvedEquipped.filter((item) => equippedIds.includes(item.id))
    }

    return {
      userId: avatar.userId,
      baseCharacter: avatar.baseCharacter,
      equippedItems: resolvedEquipped,
      ownedItemIds: payload.owned,
      updatedAt: avatar.updatedAt,
      coins: coins?.balance ?? 0,
    }
  }

  async equip(userId: string, input: EquipInput) {
    const [avatar] = await this.db
      .select()
      .from(avatars)
      .where(eq(avatars.userId, userId))

    if (!avatar) {
      throw Object.assign(new Error('Avatar not found'), { statusCode: 404, code: 'AVATAR_NOT_FOUND' })
    }

    const [item] = await this.db
      .select()
      .from(avatarItems)
      .where(eq(avatarItems.id, input.item_id))

    if (!item) {
      throw Object.assign(new Error('Item not found'), { statusCode: 404, code: 'ITEM_NOT_FOUND' })
    }

    const payload = parsePayload(avatar.equippedItems)

    // Check ownership (free items (costCoins: 0, not premium) are auto-owned; otherwise check owned list)
    const isFree = item.costCoins === 0 && !item.isPremium
    if (!isFree && !payload.owned.includes(item.id)) {
      throw Object.assign(new Error('Item not owned'), { statusCode: 403, code: 'NOT_OWNED' })
    }

    // Replace item in same slot
    const itemType = item.type as AvatarItemType
    const withoutSlot = payload.equipped.filter((e) => e.type !== itemType)
    const newEquipped = [
      ...withoutSlot,
      { id: item.id, type: itemType, previewUrl: item.previewUrl, name: item.name },
    ]

    const newPayload: AvatarPayload = { equipped: newEquipped, owned: payload.owned }

    const [updated] = await this.db
      .update(avatars)
      .set({ equippedItems: newPayload, updatedAt: new Date() })
      .where(eq(avatars.userId, userId))
      .returning()

    return updated
  }

  async unequip(userId: string, input: UnequipInput) {
    const [avatar] = await this.db
      .select()
      .from(avatars)
      .where(eq(avatars.userId, userId))

    if (!avatar) {
      throw Object.assign(new Error('Avatar not found'), { statusCode: 404, code: 'AVATAR_NOT_FOUND' })
    }

    const payload = parsePayload(avatar.equippedItems)
    const newEquipped = payload.equipped.filter((e) => e.type !== input.item_type)
    const newPayload: AvatarPayload = { equipped: newEquipped, owned: payload.owned }

    const [updated] = await this.db
      .update(avatars)
      .set({ equippedItems: newPayload, updatedAt: new Date() })
      .where(eq(avatars.userId, userId))
      .returning()

    return updated
  }

  async buyItem(userId: string, input: BuyItemInput) {
    const [avatar] = await this.db
      .select()
      .from(avatars)
      .where(eq(avatars.userId, userId))

    if (!avatar) {
      throw Object.assign(new Error('Avatar not found'), { statusCode: 404, code: 'AVATAR_NOT_FOUND' })
    }

    const [item] = await this.db
      .select()
      .from(avatarItems)
      .where(eq(avatarItems.id, input.item_id))

    if (!item) {
      throw Object.assign(new Error('Item not found'), { statusCode: 404, code: 'ITEM_NOT_FOUND' })
    }

    const payload = parsePayload(avatar.equippedItems)

    // Check if already owned
    if (payload.owned.includes(item.id)) {
      throw Object.assign(new Error('Item already owned'), { statusCode: 409, code: 'ALREADY_OWNED' })
    }

    // Check balance
    const [coinsRow] = await this.db
      .select()
      .from(userCoins)
      .where(eq(userCoins.userId, userId))

    const balance = coinsRow?.balance ?? 0

    if (balance < item.costCoins) {
      throw Object.assign(
        new Error('Insufficient coins'),
        { statusCode: 400, code: 'INSUFFICIENT_COINS', balance, required: item.costCoins },
      )
    }

    // Debit coins
    await this.db
      .update(userCoins)
      .set({ balance: balance - item.costCoins, updatedAt: new Date() })
      .where(eq(userCoins.userId, userId))

    // Add to owned list
    const newOwned = [...payload.owned, item.id]
    const newPayload: AvatarPayload = { equipped: payload.equipped, owned: newOwned }

    const [updatedAvatar] = await this.db
      .update(avatars)
      .set({ equippedItems: newPayload, updatedAt: new Date() })
      .where(eq(avatars.userId, userId))
      .returning()

    const newBalance = balance - item.costCoins

    return { avatar: updatedAvatar, newBalance }
  }

  async getShop(userId: string) {
    const [avatar] = await this.db
      .select()
      .from(avatars)
      .where(eq(avatars.userId, userId))

    const payload = avatar ? parsePayload(avatar.equippedItems) : { equipped: [], owned: [] }
    const allItems = await this.db.select().from(avatarItems)

    return allItems.map((item) => ({
      ...item,
      owned: item.costCoins === 0 && !item.isPremium ? true : payload.owned.includes(item.id),
    }))
  }

  async getCoins(userId: string) {
    const [coinsRow] = await this.db
      .select()
      .from(userCoins)
      .where(eq(userCoins.userId, userId))

    return { balance: coinsRow?.balance ?? 0 }
  }

  async selectCharacter(userId: string, input: SelectCharacterInput) {
    const validChars = ['character-1', 'character-2', 'character-3', 'character-4']
    if (!validChars.includes(input.character)) {
      throw Object.assign(new Error('Invalid character'), { statusCode: 400, code: 'INVALID_CHARACTER' })
    }

    const [updated] = await this.db
      .update(avatars)
      .set({ baseCharacter: input.character, updatedAt: new Date() })
      .where(eq(avatars.userId, userId))
      .returning()

    return updated
  }
}
