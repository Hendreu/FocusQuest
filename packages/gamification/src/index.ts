// packages/gamification/src/index.ts — barrel export
export { GamificationEngine } from './GamificationEngine'
export type { LessonCompleteResult } from './GamificationEngine'

export { XPService } from './services/XPService'
export { LevelService } from './services/LevelService'
export { StreakService } from './services/StreakService'
export { BadgeService } from './services/BadgeService'
export { QuestService } from './services/QuestService'
export { LeaderboardService } from './services/LeaderboardService'

export { LEVEL_TABLE } from './constants/levels'
export { XP_REWARDS } from './constants/xp-rewards'
export type { XPRewardKey } from './constants/xp-rewards'
export type { UserStats } from './services/BadgeService'
export type { XPSourceType } from './services/XPService'
