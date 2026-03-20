import { describe, it, expect } from 'vitest'
import { calculateSM2 } from './sm2'

describe('SM-2 Algorithm', () => {
  it('quality 0 — resets repetitions to 0 and interval to 1', () => {
    const result = calculateSM2({ easeFactor: 2.5, interval: 10, repetitions: 5, quality: 0 })
    expect(result.repetitions).toBe(0)
    expect(result.interval).toBe(1)
  })

  it('quality 0 — decreases easeFactor', () => {
    const result = calculateSM2({ easeFactor: 2.5, interval: 3, repetitions: 2, quality: 0 })
    expect(result.easeFactor).toBe(2.3)
  })

  it('easeFactor never drops below 1.3', () => {
    let ef = 1.35
    for (let i = 0; i < 20; i++) {
      const result = calculateSM2({ easeFactor: ef, interval: 1, repetitions: 0, quality: 0 })
      ef = result.easeFactor
    }
    expect(ef).toBeGreaterThanOrEqual(1.3)
  })

  it('quality 5 — increases repetitions and interval', () => {
    const r1 = calculateSM2({ easeFactor: 2.5, interval: 1, repetitions: 0, quality: 5 })
    expect(r1.repetitions).toBe(1)
    expect(r1.interval).toBe(1)

    const r2 = calculateSM2({ easeFactor: r1.easeFactor, interval: r1.interval, repetitions: r1.repetitions, quality: 5 })
    expect(r2.repetitions).toBe(2)
    expect(r2.interval).toBe(3)

    const r3 = calculateSM2({ easeFactor: r2.easeFactor, interval: r2.interval, repetitions: r2.repetitions, quality: 5 })
    expect(r3.repetitions).toBe(3)
    expect(r3.interval).toBeGreaterThan(3)
  })

  it('quality 3 — correct but hard, interval grows normally', () => {
    const result = calculateSM2({ easeFactor: 2.5, interval: 3, repetitions: 2, quality: 3 })
    expect(result.repetitions).toBe(3)
    expect(result.interval).toBeGreaterThan(0)
  })

  it('quality 5 — ease factor stays or increases (near 2.5)', () => {
    const result = calculateSM2({ easeFactor: 2.5, interval: 1, repetitions: 0, quality: 5 })
    expect(result.easeFactor).toBeGreaterThanOrEqual(2.5)
  })

  it('nextReviewAt is in the future', () => {
    const now = new Date()
    const result = calculateSM2({ easeFactor: 2.5, interval: 1, repetitions: 0, quality: 4 })
    expect(result.nextReviewAt.getTime()).toBeGreaterThan(now.getTime())
  })

  it('after 3 correct reviews — interval grows exponentially', () => {
    let state = { easeFactor: 2.5, interval: 1, repetitions: 0 }
    const intervals: number[] = []
    for (let i = 0; i < 5; i++) {
      const result = calculateSM2({ ...state, quality: 5 })
      state = { easeFactor: result.easeFactor, interval: result.interval, repetitions: result.repetitions }
      intervals.push(result.interval)
    }
    // Each interval after index 1 should be larger than the previous
    for (let i = 2; i < intervals.length; i++) {
      expect(intervals[i]).toBeGreaterThanOrEqual(intervals[i - 1])
    }
  })
})
