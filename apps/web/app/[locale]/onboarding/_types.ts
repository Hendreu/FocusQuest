export type OnboardingStep = 1 | 2 | 3 | 4

export interface OnboardingState {
  step: OnboardingStep
  preferredName: string
  selectedCharacter: 'character-1' | 'character-2' | 'character-3' | 'character-4'
  selectedAccessory: string
  sensoryAnswers: SensoryAnswers
  selectedCourseId: string | null
}

export interface SensoryAnswers {
  prefersMovement: boolean | null
  soundHelpsConcentration: boolean | null
  prefersShortSessions: boolean | null
}

export interface SensoryProfile {
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'normal' | 'large' | 'xlarge'
  soundEnabled: boolean
  sessionLength: 'short' | 'medium' | 'long'
}

export function mapAnswersToSensoryProfile(answers: SensoryAnswers): SensoryProfile {
  return {
    reducedMotion: !(answers.prefersMovement ?? false),
    highContrast: false,
    fontSize: 'normal',
    soundEnabled: answers.soundHelpsConcentration ?? false,
    sessionLength: answers.prefersShortSessions ? 'short' : 'medium',
  }
}
