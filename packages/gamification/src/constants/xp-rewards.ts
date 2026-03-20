export const XP_REWARDS = {
  LESSON_COMPLETE: 50,
  LESSON_FIRST_TIME: 75, // bonus on first completion
  QUIZ_PERFECT: 25, // bonus for 100% on quiz
  STREAK_DAY: 10, // per day of streak
  STREAK_MILESTONE_7: 50,
  STREAK_MILESTONE_30: 200,
  DAILY_LOGIN: 5,
} as const

export type XPRewardKey = keyof typeof XP_REWARDS
