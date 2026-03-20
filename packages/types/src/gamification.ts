import type { XPSourceType } from './enums'
import type {
  UserLevel,
  Streak,
  UserBadge,
  UserQuest,
  UserCoins,
  XPEvent,
  BadgeCriteria,
  QuestCriteria,
} from './entities'

export interface LevelDefinition {
  level: number
  xpRequired: number
  xpToNext: number
  title: string
}

export type { BadgeCriteria, QuestCriteria }

export interface XPSource {
  type: XPSourceType
  amount: number
  description: string
}

export interface GamificationProfile {
  userId: string
  level: UserLevel
  streak: Streak
  badges: UserBadge[]
  activeQuests: UserQuest[]
  coins: UserCoins
  recentXpEvents: XPEvent[]
  leaderboardPosition?: number
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  avatarBaseCharacter: string
  level: number
  currentXp: number
  currentStreak: number
}
