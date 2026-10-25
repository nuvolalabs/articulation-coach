import { describe, it, expect } from 'vitest'
import { toSession } from './datastore.js'

describe('toSession', () => {
  it('maps a Supabase row to the shape the UI + progress maths expect', () => {
    const row = {
      id: 'uuid-1',
      created_at: '2026-10-01T10:00:00.000Z',
      week: 2,
      day: 9,
      drill: 'warm-jaw',
      pack: 'corporate',
      prompt: 'Give a status update',
      score: 71,
      wpm: 128,
      filler_count: 3,
      transcript: 'hello there'
    }
    const s = toSession(row)
    expect(s.id).toBe('uuid-1')
    expect(s.ts).toBe(Date.parse('2026-10-01T10:00:00.000Z'))
    expect(s.score).toBe(71)
    expect(s.fillerCount).toBe(3)
    expect(s.wpm).toBe(128)
    expect(s.prompt).toBe('Give a status update')
  })

  it('defaults a missing score to 0 rather than NaN', () => {
    const s = toSession({ id: 'x', created_at: '2026-10-01T10:00:00Z', score: null })
    expect(s.score).toBe(0)
  })
})
