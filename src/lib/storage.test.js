// Tests for the progress maths (habit design: compliance rate, not a brittle
// streak). These are pure functions of the session list + the clock.
import { describe, it, expect } from 'vitest'
import {
  complianceRate,
  currentStreak,
  summarise,
  clarityTrend,
  programmeDay
} from './storage.js'

const DAY = 24 * 60 * 60 * 1000
const sess = (daysAgo, score) => ({
  id: `s${daysAgo}-${score}`,
  ts: Date.now() - daysAgo * DAY,
  score,
  prompt: 'prompt'
})

describe('complianceRate', () => {
  it('counts practised days and applies the weekly grace allowance', () => {
    const c = complianceRate([sess(0, 70), sess(1, 72), sess(2, 68)], 30)
    expect(c.practised).toBe(3)
    expect(c.grace).toBe(4) // floor(30 / 7) weeks × 1 grace day
    expect(c.rate).toBe(Math.round(((3 + 4) / 30) * 100)) // 23%
  })
  it('is 0% with no sessions', () => {
    expect(complianceRate([], 30).rate).toBe(0)
  })
})

describe('currentStreak', () => {
  it('counts consecutive days including today', () => {
    expect(currentStreak([sess(0, 70), sess(1, 70), sess(2, 70)])).toBe(3)
  })
  it('does not break the streak just because today is not done yet', () => {
    expect(currentStreak([sess(1, 70), sess(2, 70)])).toBe(2)
  })
  it('is 0 with no sessions', () => {
    expect(currentStreak([])).toBe(0)
  })
})

describe('summarise', () => {
  it('averages scores and reports the first→latest delta', () => {
    const s = summarise([sess(10, 50), sess(8, 60), sess(2, 80), sess(1, 90)])
    expect(s.total).toBe(4)
    expect(s.avgScore).toBe(70)
    expect(s.delta).toBe(40)
  })
  it('handles an empty history', () => {
    const s = summarise([])
    expect(s.total).toBe(0)
    expect(s.avgScore).toBe(0)
  })
})

describe('clarityTrend', () => {
  it('returns scores sorted oldest → newest', () => {
    const t = clarityTrend([sess(1, 90), sess(5, 50), sess(3, 70)])
    expect(t.map((p) => p.score)).toEqual([50, 70, 90])
  })
})

describe('programmeDay', () => {
  it('is day 1 before any session', () => {
    expect(programmeDay([])).toBe(1)
  })
  it('counts from the first session', () => {
    expect(programmeDay([sess(5, 70)])).toBe(6)
  })
})
