'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '../lib/auth/api-client'

export interface EquippedItem {
  id: string
  type: 'hat' | 'clothing' | 'accessory' | 'background'
  previewUrl: string
  name: string
}

export interface AvatarData {
  userId: string
  baseCharacter: string
  equippedItems: EquippedItem[]
  ownedItemIds: string[]
  coins: number
  updatedAt: string
}

export interface ShopItem {
  id: string
  name: string
  type: 'hat' | 'clothing' | 'accessory' | 'background'
  previewUrl: string
  costCoins: number
  isPremium: boolean
  layerOrder: number
  owned: boolean
}

interface UseAvatarReturn {
  avatar: AvatarData | null
  shopItems: ShopItem[]
  coins: number
  loading: boolean
  shopLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  equip: (itemId: string) => Promise<void>
  unequip: (itemType: EquippedItem['type']) => Promise<void>
  buyItem: (itemId: string) => Promise<void>
  selectCharacter: (character: string) => Promise<void>
}

export function useAvatar(): UseAvatarReturn {
  const [avatar, setAvatar] = useState<AvatarData | null>(null)
  const [shopItems, setShopItems] = useState<ShopItem[]>([])
  const [coins, setCoins] = useState(0)
  const [loading, setLoading] = useState(true)
  const [shopLoading, setShopLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAvatar = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient<AvatarData>('/avatar/me')
      setAvatar(data)
      setCoins(data.coins)
    } catch (err) {
      const e = err as Error
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchShop = useCallback(async () => {
    try {
      setShopLoading(true)
      const items = await apiClient<ShopItem[]>('/avatar/shop')
      setShopItems(items)
    } catch {
      // Non-fatal — shop can be empty
    } finally {
      setShopLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchAvatar()
    void fetchShop()
  }, [fetchAvatar, fetchShop])

  const equip = useCallback(async (itemId: string) => {
    await apiClient('/avatar/equip', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId }),
    })
    await fetchAvatar()
    // Update owned flag in shop
    setShopItems((prev) => prev.map((i) => i.id === itemId ? { ...i, owned: true } : i))
  }, [fetchAvatar])

  const unequip = useCallback(async (itemType: EquippedItem['type']) => {
    await apiClient('/avatar/unequip', {
      method: 'POST',
      body: JSON.stringify({ item_type: itemType }),
    })
    await fetchAvatar()
  }, [fetchAvatar])

  const buyItem = useCallback(async (itemId: string) => {
    const result = await apiClient<{ newBalance: number }>('/avatar/shop/buy', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId }),
    })
    setCoins(result.newBalance)
    setShopItems((prev) => prev.map((i) => i.id === itemId ? { ...i, owned: true } : i))
    await fetchAvatar()
  }, [fetchAvatar])

  const selectCharacter = useCallback(async (character: string) => {
    await apiClient('/avatar/character', {
      method: 'POST',
      body: JSON.stringify({ character }),
    })
    await fetchAvatar()
  }, [fetchAvatar])

  return {
    avatar,
    shopItems,
    coins,
    loading,
    shopLoading,
    error,
    refetch: fetchAvatar,
    equip,
    unequip,
    buyItem,
    selectCharacter,
  }
}
