// avatar.schema.ts — Zod validation schemas for avatar module
import { z } from 'zod'

export const equipSchema = z.object({
  item_id: z.string().uuid(),
})

export const unequipSchema = z.object({
  item_type: z.enum(['hat', 'clothing', 'accessory', 'background']),
})

export const buyItemSchema = z.object({
  item_id: z.string().uuid(),
})

export const selectCharacterSchema = z.object({
  character: z.string().min(1).max(50),
})

export type EquipInput = z.infer<typeof equipSchema>
export type UnequipInput = z.infer<typeof unequipSchema>
export type BuyItemInput = z.infer<typeof buyItemSchema>
export type SelectCharacterInput = z.infer<typeof selectCharacterSchema>

// Avatar JSONB payload stored in avatars.equipped_items
export interface AvatarPayload {
  equipped: EquippedItem[]
  owned: string[] // item IDs owned by user
}

export interface EquippedItem {
  id: string
  type: 'hat' | 'clothing' | 'accessory' | 'background'
  previewUrl: string
  name: string
}
