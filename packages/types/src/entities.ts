import type {
  UserRole,
  Plan,
  ContentStatus,
  ContentType,
  Language,
  QuestStatus,
  InstitutionRole,
  XPSourceType,
  Theme,
  FontSize,
  NotificationType,
  AvatarItemType,
} from './enums'
import type { SensoryProfile, NotificationSettings } from './sensory'
import type { LessonPayload } from './content-payloads'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  plan: Plan
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string
}

export interface Institution {
  id: string
  name: string
  slug: string
  licenseSeats: number
  plan: string
  createdAt: string
}

export interface InstitutionMember {
  id: string
  institutionId: string
  userId: string
  role: InstitutionRole
  invitedAt: string
  joinedAt: string | null
}

export interface Course {
  id: string
  title: string
  description: string | null
  creatorId: string
  status: ContentStatus
  language: Language
  thumbnailUrl: string | null
  isPremium: boolean
  createdAt: string
  updatedAt: string
}

export interface Module {
  id: string
  courseId: string
  title: string
  order: number
}

export interface Lesson {
  id: string
  moduleId: string
  title: string
  contentType: ContentType
  durationMinutes: number
  order: number
  isPremium: boolean
  status: ContentStatus
  xpReward: number
}

export interface LessonContent {
  id: string
  lessonId: string
  payload: LessonPayload
  updatedAt: string
}

export interface UserProgress {
  id: string
  userId: string
  lessonId: string
  completedAt: string | null
  score: number | null
  attempts: number
  timeSpentSeconds: number
}

export interface XPEvent {
  id: string
  userId: string
  sourceType: XPSourceType
  sourceId: string | null
  xpAmount: number
  createdAt: string
}

export interface UserLevel {
  userId: string
  currentXp: number
  level: number
  updatedAt: string
}

export interface Streak {
  userId: string
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
  streakFreezes: number
}

export interface BadgeCriteria {
  type: 'lesson_count' | 'streak_days' | 'level_reached' | 'quest_count' | 'xp_total'
  threshold: number
  timeframe?: 'all_time' | 'weekly' | 'daily'
}

export interface Badge {
  id: string
  slug: string
  name: string
  description: string
  iconUrl: string | null
  criteria: BadgeCriteria
  isPremium: boolean
}

export interface UserBadge {
  id: string
  userId: string
  badgeId: string
  earnedAt: string
  badge?: Badge
}

export interface QuestCriteria {
  type:
    | 'complete_lessons'
    | 'maintain_streak'
    | 'earn_xp'
    | 'complete_quizzes'
    | 'finish_course'
  target: number
  courseId?: string
  lessonIds?: string[]
}

export interface Quest {
  id: string
  slug: string
  title: string
  description: string
  xpReward: number
  coinReward: number
  criteria: QuestCriteria
  expiresAt: string | null
  isPremium: boolean
}

export interface UserQuest {
  id: string
  userId: string
  questId: string
  status: QuestStatus
  progress: Record<string, number>
  startedAt: string
  completedAt: string | null
  quest?: Quest
}

export interface Avatar {
  userId: string
  baseCharacter: string
  equippedItems: string[]
  updatedAt: string
}

export interface AvatarItem {
  id: string
  slug: string
  name: string
  type: AvatarItemType
  costCoins: number
  isPremium: boolean
  previewUrl: string
  layerOrder: number
}

export interface UserCoins {
  userId: string
  balance: number
  updatedAt: string
}

export interface UserPreferences {
  userId: string
  theme: Theme
  language: Language
  sensoryProfile: SensoryProfile
  focusDurationMinutes: number
  animationsEnabled: boolean
  soundEnabled: boolean
  fontSize: FontSize
  notificationSettings: NotificationSettings
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  payload: Record<string, unknown>
  readAt: string | null
  createdAt: string
}

export interface SpacedRepetitionItem {
  id: string
  userId: string
  lessonId: string
  nextReviewAt: string
  interval: number
  easeFactor: number
  repetitions: number
}
