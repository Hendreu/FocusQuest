import React from 'react'
import { clsx } from 'clsx'

export interface EquippedItem {
  id: string
  type: 'hat' | 'clothing' | 'accessory' | 'background'
  previewUrl: string
  name: string
}

export interface GameAvatarProps {
  avatar: {
    baseCharacter: string
    equippedItems: EquippedItem[]
  }
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  className?: string
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-36 h-36',
  xl: 'w-48 h-48',
}

/**
 * GameAvatar — layered SVG character component for the avatar customization system.
 *
 * Layer order (z-index):
 *   background  z-0  — decorative background behind the character
 *   body/base   z-10 — the base character SVG
 *   clothing    z-20 — shirts, pants, outfits (layerOrder: ~5)
 *   accessory   z-30 — glasses, bags, wings (layerOrder: ~8)
 *   hat         z-40 — hats, helmets, crowns (layerOrder: ~10)
 */
export function GameAvatar({
  avatar,
  size = 'md',
  animated = false,
  className,
}: GameAvatarProps) {
  const { baseCharacter, equippedItems } = avatar

  const background = equippedItems.find((i) => i.type === 'background')
  const clothing = equippedItems.find((i) => i.type === 'clothing')
  const accessory = equippedItems.find((i) => i.type === 'accessory')
  const hat = equippedItems.find((i) => i.type === 'hat')

  const baseUrl = `/avatars/${baseCharacter}/base.svg`

  return (
    <div
      className={clsx(
        'relative inline-flex items-center justify-center overflow-hidden rounded-full',
        sizeMap[size],
        animated && 'transition-transform hover:scale-105',
        className,
      )}
      role="img"
      aria-label={`Game avatar using ${baseCharacter}`}
    >
      {/* Background layer — z-0 */}
      {background ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={background.previewUrl}
          alt={background.name}
          className="absolute inset-0 w-full h-full object-cover z-0"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full z-0 bg-gradient-to-b from-blue-100 to-purple-100" />
      )}

      {/* Base character — z-10 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={baseUrl}
        alt={`${baseCharacter} base character`}
        className="absolute inset-0 w-full h-full object-contain z-10"
        loading="lazy"
        onError={(e) => {
          // Fallback to a coloured placeholder if image not found
          const target = e.currentTarget as HTMLImageElement
          target.style.display = 'none'
        }}
      />

      {/* Clothing layer — z-20 */}
      {clothing && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={clothing.previewUrl}
          alt={clothing.name}
          className="absolute inset-0 w-full h-full object-contain z-20"
          loading="lazy"
        />
      )}

      {/* Accessory layer — z-30 */}
      {accessory && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={accessory.previewUrl}
          alt={accessory.name}
          className="absolute inset-0 w-full h-full object-contain z-30"
          loading="lazy"
        />
      )}

      {/* Hat layer — z-40 */}
      {hat && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hat.previewUrl}
          alt={hat.name}
          className="absolute inset-0 w-full h-full object-contain z-40"
          loading="lazy"
        />
      )}
    </div>
  )
}
