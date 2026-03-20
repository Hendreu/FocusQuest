// SM-2 Algorithm — pure TypeScript, no side effects

export interface SM2Input {
  easeFactor: number   // 1.3–2.5, starts at 2.5
  interval: number     // days since last review
  repetitions: number  // number of successful reviews so far
  quality: number      // 0–5 (0=blackout, 5=perfect recall)
}

export interface SM2Output {
  easeFactor: number
  interval: number
  repetitions: number
  nextReviewAt: Date
}

/**
 * Calculate the next review schedule using the SM-2 algorithm.
 * - quality < 3: reset (answer was wrong or uncertain)
 * - quality >= 3: schedule next review, update ease factor
 */
export function calculateSM2(input: SM2Input): SM2Output {
  const { quality, repetitions, easeFactor, interval } = input

  let newRepetitions: number
  let newInterval: number
  // EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
  const newEaseFactorRaw =
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  let newEaseFactor = Math.max(1.3, Math.round(newEaseFactorRaw * 100) / 100)

  if (quality < 3) {
    // Wrong answer — reset, don't change ease factor much but cap at 1.3
    newRepetitions = 0
    newInterval = 1
    newEaseFactor = Math.max(1.3, easeFactor - 0.2)
  } else {
    // Correct answer
    newRepetitions = repetitions + 1
    if (repetitions === 0) {
      newInterval = 1
    } else if (repetitions === 1) {
      newInterval = 3
    } else {
      newInterval = Math.round(interval * easeFactor)
    }
  }

  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval)

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewAt,
  }
}
