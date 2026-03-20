export * from './enums'
export * from './sensory'
export * from './content-payloads'
export * from './entities'
export * from './gamification'
export * from './api'

export const FREEMIUM_LIMITS = {
  FREE_LESSONS_PER_COURSE: 3,
  FREE_ACTIVE_QUESTS: 2,
  FREE_LEADERBOARD_VISIBLE: true,
  FREE_AVATAR_ITEMS: 10,
  PREMIUM_REQUIRED_FEATURES: [
    'unlimited_lessons',
    'premium_quests',
    'premium_avatar_items',
    'advanced_stats',
  ] as const,
} as const
