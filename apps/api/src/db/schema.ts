import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

// ===========================================================================
// Enums
// ===========================================================================

export const userRoleEnum = pgEnum('user_role', [
  'student',
  'creator',
  'institution_admin',
  'super_admin',
])

export const planEnum = pgEnum('plan', [
  'free',
  'premium_individual',
  'premium_institution',
])

export const contentStatusEnum = pgEnum('content_status', [
  'draft',
  'review',
  'published',
  'archived',
])

export const contentTypeEnum = pgEnum('content_type', [
  'text',
  'video',
  'quiz',
  'code',
])

export const languageEnum = pgEnum('language', ['pt-BR', 'en'])

export const questStatusEnum = pgEnum('quest_status', [
  'active',
  'completed',
  'failed',
])

export const institutionRoleEnum = pgEnum('institution_role', [
  'admin',
  'student',
])

export const xpSourceEnum = pgEnum('xp_source', [
  'lesson_complete',
  'streak_bonus',
  'badge_earned',
  'quest_complete',
  'daily_login',
])

export const themeEnum = pgEnum('theme', ['light', 'dark', 'high-contrast'])

export const fontSizeEnum = pgEnum('font_size', ['normal', 'large', 'xlarge'])

export const notificationTypeEnum = pgEnum('notification_type', [
  'streak_reminder',
  'badge_earned',
  'level_up',
  'institution_invite',
  'quest_completed',
])

export const avatarItemTypeEnum = pgEnum('avatar_item_type', [
  'hat',
  'clothing',
  'accessory',
  'background',
])

// ===========================================================================
// Tables — Users & Auth
// ===========================================================================

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }), // null if OAuth
  role: userRoleEnum('role').default('student').notNull(),
  plan: planEnum('plan').default('free').notNull(),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const oauthAccounts = pgTable('oauth_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: timestamp('expires_at'),
})

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  token: varchar('token', { length: 512 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ===========================================================================
// Tables — Institutions
// ===========================================================================

export const institutions = pgTable('institutions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  licenseSeats: integer('license_seats').default(10).notNull(),
  plan: varchar('plan', { length: 50 }).default('basic').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const institutionMembers = pgTable(
  'institution_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    institutionId: uuid('institution_id')
      .references(() => institutions.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    role: institutionRoleEnum('role').default('student').notNull(),
    invitedAt: timestamp('invited_at').defaultNow().notNull(),
    joinedAt: timestamp('joined_at'),
    inviteToken: varchar('invite_token', { length: 255 }).unique(),
    inviteExpiresAt: timestamp('invite_expires_at'),
  },
  (t) => ({
    idxInstitution: index('idx_institution_members_institution').on(
      t.institutionId,
    ),
  }),
)

// ===========================================================================
// Tables — Content
// ===========================================================================

export const courses = pgTable('courses', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  creatorId: uuid('creator_id')
    .references(() => users.id)
    .notNull(),
  status: contentStatusEnum('status').default('draft').notNull(),
  language: languageEnum('language').default('pt-BR').notNull(),
  thumbnailUrl: varchar('thumbnail_url', { length: 512 }),
  isPremium: boolean('is_premium').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const modules = pgTable('modules', {
  id: uuid('id').defaultRandom().primaryKey(),
  courseId: uuid('course_id')
    .references(() => courses.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  order: integer('order').notNull(),
})

export const lessons = pgTable('lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  moduleId: uuid('module_id')
    .references(() => modules.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  contentType: contentTypeEnum('content_type').notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(5),
  order: integer('order').notNull(),
  isPremium: boolean('is_premium').default(false),
  status: contentStatusEnum('status').default('draft').notNull(),
  xpReward: integer('xp_reward').default(50).notNull(),
})

export const lessonContent = pgTable('lesson_content', {
  id: uuid('id').defaultRandom().primaryKey(),
  lessonId: uuid('lesson_id')
    .references(() => lessons.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  payload: jsonb('payload').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ===========================================================================
// Tables — Progress
// ===========================================================================

export const userProgress = pgTable(
  'user_progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    lessonId: uuid('lesson_id')
      .references(() => lessons.id, { onDelete: 'cascade' })
      .notNull(),
    completedAt: timestamp('completed_at'),
    score: integer('score'),
    attempts: integer('attempts').default(0).notNull(),
    timeSpentSeconds: integer('time_spent_seconds').default(0),
  },
  (t) => ({
    idxUserLesson: index('idx_user_progress_user_lesson').on(
      t.userId,
      t.lessonId,
    ),
  }),
)

// ===========================================================================
// Tables — Gamification
// ===========================================================================

export const xpEvents = pgTable(
  'xp_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    sourceType: xpSourceEnum('source_type').notNull(),
    sourceId: uuid('source_id'),
    xpAmount: integer('xp_amount').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    idxUser: index('idx_xp_events_user').on(t.userId),
  }),
)

export const userLevels = pgTable('user_levels', {
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .primaryKey(),
  currentXp: integer('current_xp').default(0).notNull(),
  level: integer('level').default(1).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const streaks = pgTable('streaks', {
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .primaryKey(),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  lastActivityDate: date('last_activity_date'),
  streakFreezes: integer('streak_freezes').default(0).notNull(),
})

export const badges = pgTable('badges', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  iconUrl: varchar('icon_url', { length: 512 }),
  criteria: jsonb('criteria').notNull(),
  isPremium: boolean('is_premium').default(false),
})

export const userBadges = pgTable('user_badges', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  badgeId: uuid('badge_id')
    .references(() => badges.id)
    .notNull(),
  earnedAt: timestamp('earned_at').defaultNow().notNull(),
})

export const quests = pgTable('quests', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  xpReward: integer('xp_reward').notNull(),
  coinReward: integer('coin_reward').default(0),
  criteria: jsonb('criteria').notNull(),
  expiresAt: timestamp('expires_at'),
  isPremium: boolean('is_premium').default(false),
})

export const userQuests = pgTable(
  'user_quests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    questId: uuid('quest_id')
      .references(() => quests.id)
      .notNull(),
    status: questStatusEnum('status').default('active').notNull(),
    progress: jsonb('progress').default({}).notNull(),
    startedAt: timestamp('started_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
  },
  (t) => ({
    idxUserStatus: index('idx_user_quests_user_status').on(t.userId, t.status),
  }),
)

// ===========================================================================
// Tables — Avatar
// ===========================================================================

export const avatars = pgTable('avatars', {
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .primaryKey(),
  baseCharacter: varchar('base_character', { length: 50 })
    .default('character-1')
    .notNull(),
  equippedItems: jsonb('equipped_items').default([]).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const avatarItems = pgTable('avatar_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  type: avatarItemTypeEnum('type').notNull(),
  costCoins: integer('cost_coins').default(0).notNull(),
  isPremium: boolean('is_premium').default(false),
  previewUrl: varchar('preview_url', { length: 512 }).notNull(),
  layerOrder: integer('layer_order').default(0).notNull(),
})

export const userCoins = pgTable('user_coins', {
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .primaryKey(),
  balance: integer('balance').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ===========================================================================
// Tables — Preferences
// ===========================================================================

export const userPreferences = pgTable('user_preferences', {
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .primaryKey(),
  theme: themeEnum('theme').default('light').notNull(),
  language: languageEnum('language').default('pt-BR').notNull(),
  sensoryProfile: jsonb('sensory_profile')
    .default({
      animationIntensity: 100,
      soundEnabled: true,
      highContrast: false,
    })
    .notNull(),
  focusDurationMinutes: integer('focus_duration_minutes').default(25).notNull(),
  animationsEnabled: boolean('animations_enabled').default(true).notNull(),
  soundEnabled: boolean('sound_enabled').default(true).notNull(),
  fontSize: fontSizeEnum('font_size').default('normal').notNull(),
  notificationSettings: jsonb('notification_settings')
    .default({
      streakReminder: true,
      badgeEarned: true,
      levelUp: true,
      institutionInvite: true,
      questCompleted: true,
    })
    .notNull(),
})

// ===========================================================================
// Tables — Notifications
// ===========================================================================

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    type: notificationTypeEnum('type').notNull(),
    payload: jsonb('payload').notNull(),
    readAt: timestamp('read_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    idxUserUnread: index('idx_notifications_user_unread').on(
      t.userId,
      t.readAt,
    ),
  }),
)

// ===========================================================================
// Tables — Spaced Repetition
// ===========================================================================

export const spacedRepetitionItems = pgTable(
  'spaced_repetition_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    lessonId: uuid('lesson_id')
      .references(() => lessons.id)
      .notNull(),
    questionId: text('question_id').notNull().default(''),
    nextReviewAt: timestamp('next_review_at').notNull(),
    interval: integer('interval').default(1).notNull(),
    easeFactor: real('ease_factor').default(2.5).notNull(),
    repetitions: integer('repetitions').default(0).notNull(),
  },
  (t) => ({
    idxNextReview: index('idx_spaced_repetition_next_review').on(
      t.userId,
      t.nextReviewAt,
    ),
    uniqueUserLessonQuestion: unique('uq_sr_user_lesson_question').on(t.userId, t.lessonId, t.questionId),
  }),
)

// ===========================================================================
// Inferred types (used by packages/types in Task 04)
// ===========================================================================

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Course = typeof courses.$inferSelect
export type Lesson = typeof lessons.$inferSelect
export type Badge = typeof badges.$inferSelect
export type Quest = typeof quests.$inferSelect
export type XpEvent = typeof xpEvents.$inferSelect
export type Streak = typeof streaks.$inferSelect
export type UserLevel = typeof userLevels.$inferSelect
export type UserPreferences = typeof userPreferences.$inferSelect
export type Institution = typeof institutions.$inferSelect
export type AvatarItem = typeof avatarItems.$inferSelect
export type Notification = typeof notifications.$inferSelect
export type SpacedRepetitionItem = typeof spacedRepetitionItems.$inferSelect
