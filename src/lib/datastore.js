// Session persistence backed by Supabase (per-user rows, RLS-protected).
// localStorage is kept as an offline read cache so the PWA still shows your
// history when the network is down.
import { supabase } from './supabase.js'

const CACHE_KEY = 'articulate.sessions.cache.v1'

/** Map a Supabase row → the shape the UI/progress maths already expect. */
export function toSession(row) {
  return {
    id: row.id,
    ts: Date.parse(row.created_at),
    score: row.score ?? 0,
    wpm: row.wpm,
    fillerCount: row.filler_count,
    prompt: row.prompt,
    pack: row.pack,
    drill: row.drill,
    week: row.week,
    day: row.day,
    transcript: row.transcript
  }
}

export function cachedSessions() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function cache(list) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(list))
  } catch {
    /* storage full / private mode — cache is best-effort */
  }
}

export async function listSessions() {
  if (!supabase) return cachedSessions()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  const rows = (data ?? []).map(toSession)
  cache(rows)
  return rows
}

export async function insertSession(s) {
  if (!supabase) throw new Error('Supabase is not configured')
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('You are not signed in')
  const { error } = await supabase.from('sessions').insert({
    user_id: user.id,
    week: s.week,
    day: s.day,
    drill: s.drill,
    pack: s.pack,
    prompt: s.prompt,
    score: s.score,
    wpm: s.wpm,
    filler_count: s.fillerCount,
    transcript: s.transcript
  })
  if (error) throw error
}

export async function clearAllSessions() {
  if (!supabase) {
    cache([])
    return
  }
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return
  const { error } = await supabase.from('sessions').delete().eq('user_id', user.id)
  if (error) throw error
  cache([])
}
