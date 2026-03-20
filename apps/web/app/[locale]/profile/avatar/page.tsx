'use client'

import React, { useState } from 'react'
import { useAvatar } from '../../../../hooks/useAvatar'
import type { ShopItem } from '../../../../hooks/useAvatar'
import { GameAvatar } from '@repo/design-system'

const CHARACTERS = ['character-1', 'character-2', 'character-3', 'character-4']

type ItemType = 'hat' | 'clothing' | 'accessory' | 'background' | 'all'

export default function AvatarPage() {
  const {
    avatar,
    shopItems,
    coins,
    loading,
    shopLoading,
    error,
    equip,
    unequip,
    buyItem,
    selectCharacter,
  } = useAvatar()

  const [activeTab, setActiveTab] = useState<ItemType>('all')
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const filteredItems: ShopItem[] =
    activeTab === 'all'
      ? shopItems
      : shopItems.filter((i) => i.type === activeTab)

  async function handleEquip(itemId: string) {
    setActionError(null)
    setActionLoading(itemId)
    try {
      await equip(itemId)
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleUnequip(itemType: ShopItem['type']) {
    setActionError(null)
    setActionLoading(`unequip-${itemType}`)
    try {
      await unequip(itemType)
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleBuy(itemId: string) {
    setActionError(null)
    setActionLoading(`buy-${itemId}`)
    try {
      await buyItem(itemId)
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleSelectCharacter(character: string) {
    setActionError(null)
    setActionLoading(`char-${character}`)
    try {
      await selectCharacter(character)
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 animate-pulse">Loading avatar…</p>
      </div>
    )
  }

  if (error || !avatar) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error ?? 'Failed to load avatar'}</p>
      </div>
    )
  }

  const tabs: { label: string; value: ItemType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Hats', value: 'hat' },
    { label: 'Clothing', value: 'clothing' },
    { label: 'Accessories', value: 'accessory' },
    { label: 'Backgrounds', value: 'background' },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Avatar Customization</h1>

        {/* Coins */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-yellow-500 text-xl">🪙</span>
          <span className="font-semibold text-gray-700">{coins} coins</span>
        </div>

        {actionError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {actionError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel — preview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar preview */}
            <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-800 self-start">Preview</h2>
              <GameAvatar
                avatar={{
                  baseCharacter: avatar.baseCharacter,
                  equippedItems: avatar.equippedItems,
                }}
                size="xl"
                animated
              />
              <p className="text-sm text-gray-500 capitalize">{avatar.baseCharacter.replace('-', ' ')}</p>
            </div>

            {/* Character selection */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Base Character</h2>
              <div className="grid grid-cols-2 gap-3">
                {CHARACTERS.map((char) => (
                  <button
                    key={char}
                    onClick={() => void handleSelectCharacter(char)}
                    disabled={actionLoading === `char-${char}`}
                    className={`relative rounded-xl border-2 p-2 transition-all ${
                      avatar.baseCharacter === char
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    } disabled:opacity-50`}
                    aria-label={`Select ${char}`}
                    aria-pressed={avatar.baseCharacter === char}
                  >
                    <GameAvatar
                      avatar={{ baseCharacter: char, equippedItems: [] }}
                      size="md"
                      className="mx-auto"
                    />
                    <p className="text-xs text-center mt-1 text-gray-600 capitalize">
                      {char.replace('-', ' ')}
                    </p>
                    {actionLoading === `char-${char}` && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl">
                        <span className="text-xs text-purple-500">…</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Equipped items */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Equipped</h2>
              {avatar.equippedItems.length === 0 ? (
                <p className="text-sm text-gray-400">Nothing equipped yet.</p>
              ) : (
                <ul className="space-y-2">
                  {avatar.equippedItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.previewUrl}
                          alt={item.name}
                          className="w-8 h-8 object-contain rounded"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{item.type}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => void handleUnequip(item.type)}
                        disabled={actionLoading === `unequip-${item.type}`}
                        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                        aria-label={`Unequip ${item.name}`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right panel — shop */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Shop</h2>

              {/* Tabs */}
              <div className="flex gap-2 flex-wrap mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activeTab === tab.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {shopLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <p className="text-gray-400 text-sm">No items in this category.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {filteredItems.map((item) => {
                    const isEquipped = avatar.equippedItems.some((e) => e.id === item.id)
                    const isFree = item.costCoins === 0 && !item.isPremium
                    const canAfford = coins >= item.costCoins

                    return (
                      <div
                        key={item.id}
                        className={`relative rounded-xl border-2 p-3 flex flex-col gap-2 transition-all ${
                          isEquipped
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Item image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.previewUrl}
                          alt={item.name}
                          className="w-full h-24 object-contain rounded-lg bg-gray-50"
                        />

                        {/* Item info */}
                        <div>
                          <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{item.type}</p>
                        </div>

                        {/* Price / owned badge */}
                        <div className="flex items-center justify-between">
                          {isFree ? (
                            <span className="text-xs text-green-600 font-medium">Free</span>
                          ) : item.isPremium ? (
                            <span className="text-xs text-amber-600 font-medium">✨ Premium</span>
                          ) : (
                            <span className="text-xs text-gray-600">
                              🪙 {item.costCoins}
                            </span>
                          )}

                          {item.owned && !isEquipped && (
                            <span className="text-xs text-blue-500 font-medium">Owned</span>
                          )}
                        </div>

                        {/* Action button */}
                        {isEquipped ? (
                          <button
                            onClick={() => void handleUnequip(item.type)}
                            disabled={actionLoading === `unequip-${item.type}`}
                            className="w-full py-1.5 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-50"
                          >
                            {actionLoading === `unequip-${item.type}` ? '…' : 'Unequip'}
                          </button>
                        ) : item.owned || isFree ? (
                          <button
                            onClick={() => void handleEquip(item.id)}
                            disabled={actionLoading === item.id}
                            className="w-full py-1.5 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                          >
                            {actionLoading === item.id ? '…' : 'Equip'}
                          </button>
                        ) : item.isPremium ? (
                          <button
                            disabled
                            className="w-full py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
                          >
                            Premium only
                          </button>
                        ) : (
                          <button
                            onClick={() => void handleBuy(item.id)}
                            disabled={actionLoading === `buy-${item.id}` || !canAfford}
                            className="w-full py-1.5 rounded-lg text-xs font-medium bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === `buy-${item.id}`
                              ? '…'
                              : !canAfford
                                ? 'Not enough coins'
                                : `Buy (🪙 ${item.costCoins})`}
                          </button>
                        )}

                        {/* Equipped badge */}
                        {isEquipped && (
                          <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                            ✓
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
