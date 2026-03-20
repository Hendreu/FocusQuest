export interface SensoryProfile {
  /** 0–100; controls animation speed/intensity */
  animationIntensity: number
  soundEnabled: boolean
  highContrast: boolean
}

export interface NotificationSettings {
  streakReminder: boolean
  badgeEarned: boolean
  levelUp: boolean
  institutionInvite: boolean
  questCompleted: boolean
}
