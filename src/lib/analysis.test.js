import { describe, it, expect } from 'vitest'
import {
  tokenize,
  countFillers,
  wordsPerMinute,
  paceVerdict,
  fillerRate,
  pauseStats,
  pitchStats,
  clarityScore,
  analyze,
  topSuggestion,
  renderSummary,
  PACE
} from '../lib/analysis.js'

describe('tokenize', () => {
  it('lowercases and strips punctuation', () => {
    expect(tokenize("We need to submit the report, by Friday!")).toEqual([
      'we', 'need', 'to', 'submit', 'the', 'report', 'by', 'friday'
    ])
  })
  it('handles empty input', () => {
    expect(tokenize('')).toEqual([])
    expect(tokenize(null)).toEqual([])
  })
})

describe('countFillers', () => {
  it('counts single fillers', () => {
    expect(countFillers('Um, so I, uh, think').total).toBe(3)
  })
  it('counts multi-word fillers as one', () => {
    const r = countFillers('It is, you know, kind of hard')
    expect(r.byType['you know']).toBe(1)
    expect(r.byType['kind of']).toBe(1)
    expect(r.total).toBe(2)
  })
  it('does not count substrings of real words', () => {
    // "summer" must not trigger "um"
    expect(countFillers('the summer umbrella').total).toBe(0)
  })
})

describe('pace', () => {
  it('computes words per minute', () => {
    expect(wordsPerMinute(145, 60)).toBe(145)
    expect(wordsPerMinute(60, 39.9)).toBe(90)
  })
  it('guards against zero duration', () => {
    expect(wordsPerMinute(100, 0)).toBe(0)
  })
  it('classifies pace', () => {
    expect(paceVerdict(100)).toBe('too_slow')
    expect(paceVerdict(140)).toBe('good')
    expect(paceVerdict(200)).toBe('too_fast')
    expect(paceVerdict(0)).toBe('unknown')
  })
  it('target is inside the good band', () => {
    expect(PACE.target).toBeGreaterThanOrEqual(PACE.min)
    expect(PACE.target).toBeLessThanOrEqual(PACE.max)
  })
})

describe('fillerRate', () => {
  it('reports per-minute rate', () => {
    expect(fillerRate(6, 60)).toBe(6)
    expect(fillerRate(3, 30)).toBe(6)
  })
})

describe('pauseStats', () => {
  it('uses real word timings when provided', () => {
    const r = pauseStats({ wordTimings: [0, 0.3, 0.6, 2.5, 2.8], durationSec: 3 })
    expect(r.estimated).toBe(false)
    expect(r.pauses).toBe(1)
    expect(r.longestPause).toBeCloseTo(1.9, 1)
  })
  it('falls back to an estimate without timings', () => {
    const r = pauseStats({ wordCount: 10, durationSec: 20 })
    expect(r.estimated).toBe(true)
    expect(r.pauses).toBeGreaterThan(0)
  })
})

describe('pitchStats', () => {
  it('returns null for too few samples', () => {
    expect(pitchStats([100, 110])).toBeNull()
  })
  it('scores a monotone delivery low', () => {
    const flat = pitchStats([120, 121, 120, 120, 121, 120, 120])
    expect(flat.variety).toBeLessThan(20)
  })
  it('scores an expressive delivery high', () => {
    const range = [110, 130, 150, 175, 200, 175, 150, 130]
    expect(pitchStats(range).variety).toBeGreaterThan(40)
  })
})

describe('clarityScore', () => {
  it('rewards on-target pace and no fillers', () => {
    expect(clarityScore({ wpm: 145, fillerPerMinute: 0, pitchVariety: 70 })).toBeGreaterThan(85)
  })
  it('drops as fillers rise', () => {
    const clean = clarityScore({ wpm: 145, fillerPerMinute: 0, pitchVariety: 50 })
    const dirty = clarityScore({ wpm: 145, fillerPerMinute: 8, pitchVariety: 50 })
    expect(dirty).toBeLessThan(clean)
  })
  it('drops as pace drifts from target', () => {
    const onTarget = clarityScore({ wpm: 145, fillerPerMinute: 0, pitchVariety: 50 })
    const fast = clarityScore({ wpm: 220, fillerPerMinute: 0, pitchVariety: 50 })
    expect(fast).toBeLessThan(onTarget)
  })
})

describe('analyze', () => {
  const attempt = {
    transcript: 'We need to submit the report by Friday. Um, the client, uh, expects it.',
    durationSec: 12,
    pitchHz: [120, 135, 150, 140, 160, 145, 130, 155]
  }
  it('is deterministic', () => {
    expect(analyze(attempt)).toEqual(analyze(attempt))
  })
  it('produces the expected shape', () => {
    const r = analyze(attempt)
    expect(r.wordCount).toBeGreaterThan(0)
    expect(r).toHaveProperty('wpm')
    expect(r.fillerCount).toBe(2)
    expect(r).toHaveProperty('pauses')
    expect(typeof r.score).toBe('number')
    expect(r.score).toBeGreaterThanOrEqual(0)
    expect(r.score).toBeLessThanOrEqual(100)
  })
  it('handles an empty attempt gracefully', () => {
    const r = analyze({ transcript: '', durationSec: 0 })
    expect(r.wordCount).toBe(0)
    expect(r.score).toBe(0)
  })
})

describe('topSuggestion', () => {
  it('targets fillers when they dominate', () => {
    const r = analyze({ transcript: 'um uh um uh um uh', durationSec: 10 })
    expect(topSuggestion(r).toLowerCase()).toContain('filler')
  })
  it('tells a fast speaker to slow down', () => {
    const many = Array.from({ length: 80 }, () => 'word').join(' ')
    const r = analyze({ transcript: many, durationSec: 20 })
    expect(r.pace).toBe('too_fast')
    expect(topSuggestion(r).toLowerCase()).toContain('slow')
  })
  it('always returns a string', () => {
    expect(typeof topSuggestion(null)).toBe('string')
  })
})

describe('renderSummary', () => {
  it('includes the score and pace', () => {
    const r = analyze({ transcript: 'One clear sentence here about the quarter.', durationSec: 5 })
    const s = renderSummary(r)
    expect(s).toContain('Clarity')
    expect(s).toContain('wpm')
  })
})
