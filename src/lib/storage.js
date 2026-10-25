// Progress maths (pure, clock-driven). Persistence lives in datastore.js —
// these functions only take a list of sessions and return numbers, which keeps
// them trivially testable.
//
// Habit design follows the research: a *compliance rate* over a rolling window
// (not a brittle consecutive-day counter), and a weekly grace day so one miss
// is data rather than a "quit moment".

const GRACE_PER_WEEK = 1
const DAY_MS = 24 * 60 * 60 * 1000

function dayKey(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

/** Distinct calendar days with at least one session. */
export function activeDays(sessions) {
  const set = new Set()
  for (const s of sessions || []) set.add(dayKey(s.ts))
  return set
}

/** Compliance over the last `windowDays`: practised days / window, forgiving 1 miss/week. */
export function complianceRate(sessions, windowDays = 30) {
  const days = activeDays(sessions)
  const today = Date.now()
  let practised = 0
  for (let i = 0; i < windowDays; i++) {
    if (days.has(dayKey(today - i * DAY_MS))) practised += 1
  }
  const grace = Math.floor(windowDays / 7) * GRACE_PER_WEEK
  // Grace days forgive real misses — they must not manufacture a non-zero
  // compliance for someone who has never practised.
  const effective = practised === 0 ? 0 : Math.min(windowDays, practised + grace)
  return {
    practised,
    windowDays,
    grace,
    rate: Math.round((effective / windowDays) * 100)
  }
}

/** Current streak in days, allowing one grace day per rolling week. */
export function currentStreak(sessions) {
  const days = activeDays(sessions)
  if (days.size === 0) return 0
  let streak = 0
  let graceLeft = GRACE_PER_WEEK
  let cursor = Date.now()
  let week = 0
  for (let i = 0; i < 400; i++) {
    const isDay = days.has(dayKey(cursor))
    if (isDay) {
      streak += 1
      graceLeft = GRACE_PER_WEEK // reset each elapsed week
    } else if (i === 0) {
      // today may simply not have happened yet — don't break the streak on it
    } else if (graceLeft > 0) {
      graceLeft -= 1 // grace day: skipped without breaking
    } else {
      break
    }
    if (i > 0 && i % 7 === 0) week += 1
    cursor -= DAY_MS
  }
  return streak
}

/** Clarity score trend, oldest → newest. */
export function clarityTrend(sessions) {
  return (sessions || [])
    .filter((s) => typeof s.score === 'number')
    .sort((a, b) => a.ts - b.ts)
    .map((s) => ({ ts: s.ts, score: s.score }))
}

export function summarise(sessions) {
  const list = sessions || []
  const scores = list.map((s) => s.score).filter((n) => typeof n === 'number')
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const first = scores.length ? scores.slice(0, Math.max(1, Math.round(scores.length / 4))) : []
  const last = scores.length ? scores.slice(-Math.max(1, Math.round(scores.length / 4))) : []
  const avgOf = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)
  const delta = Math.round(avgOf(last) - avgOf(first))
  return {
    total: list.length,
    avgScore: avg,
    delta,
    streak: currentStreak(list),
    compliance: complianceRate(list, 30)
  }
}

/** Distinct days since the first session + 1 → "day N" of the programme. */
export function programmeDay(sessions) {
  const list = sessions || []
  if (!list.length) return 1
  const first = Math.min(...list.map((s) => s.ts))
  return Math.floor((Date.now() - first) / DAY_MS) + 1
}
