import { tokens } from './src/tokens'
import type { Config } from 'tailwindcss'

/**
 * FocusQuest Tailwind preset.
 * Extends the default Tailwind config with design system tokens.
 *
 * Usage in apps/web/tailwind.config.ts:
 *   import { focusQuestPreset } from '@repo/design-system/tailwind-preset'
 *   export default { presets: [focusQuestPreset], ... }
 */
export const focusQuestPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        primary: tokens.colors.primary,
        neutral: tokens.colors.neutral,
        success: tokens.colors.success,
        warning: tokens.colors.warning,
        error: tokens.colors.error,
        xp: tokens.colors.xp,
        streak: tokens.colors.streak,
        badge: tokens.colors.badge,
        coin: tokens.colors.coin,
      },
      fontFamily: {
        sans: [tokens.typography.fontFamily.sans],
        mono: [tokens.typography.fontFamily.mono],
      },
      fontSize: tokens.typography.fontSize,
      fontWeight: tokens.typography.fontWeight as Record<string, string>,
      lineHeight: tokens.typography.lineHeight,
      spacing: tokens.spacing as Record<string | number, string>,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.shadows,
      transitionDuration: tokens.animation.duration,
      transitionTimingFunction: tokens.animation.easing,
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        dialogSlideIn: {
          from: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.96)' },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
        dialogSlideOut: {
          from: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
          to: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.96)' },
        },
        tooltipIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        toastSlideIn: {
          from: { opacity: '0', transform: 'translateX(calc(100% + 1rem))' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        toastSlideOut: {
          from: { opacity: '1', transform: 'translateX(0)' },
          to: { opacity: '0', transform: 'translateX(calc(100% + 1rem))' },
        },
        toastSwipeOut: {
          from: { transform: 'translateX(var(--radix-toast-swipe-end-x))' },
          to: { transform: 'translateX(calc(100% + 1rem))' },
        },
        shimmer: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
}
