// Pure, dependency-free analysis of a spoken attempt.
//
// Everything here is a deterministic function of its inputs, so it is unit
// tested without a browser. The recording/ASR layers (audio.js, speech.js) only
// *feed* this module; the scoring logic itself never touches the DOM.

// Filler words/sounds. Multi-word entries are matched first so "you know" is
// counted as one filler rather than "you" + "know".
export const FILLERS = [
  'you know', 'i mean', 'kind of', 'sort of', 'sorta', 'kinda',
  'um', 'uh', 'erm', 'er', 'ah', 'eh', 'hmm', 'mmm',
  'like', 'basically', 'actually', 'literally', 'honestly', 'right',
  'so', 'well', 'just', 'stuff', 'things'
]

// Comfortable adult speaking pace. ~145 wpm reads as easy to follow.
export const PACE = { min: 120, target: 145, max: 170 }

// How much a gap (in seconds) between spoken words counts as a "pause".
export const PAUSE_THRESHOLD_S = 1.2

const WORD_RE = /[a-z0-9']+/gi

export function tokenize(text) {
  return (text || '').toLowerCase().match(WORD_RE) || []
}

/** Count filler words/sounds, greedily consuming multi-word fillers first. */
export function countFillers(text) {
  const words = tokenize(text)
  const byType = {}
  let i = 0
  while (i < words.length) {
    let matched = null
    for (const f of FILLERS) {
      const parts = f.split(' ')
      if (parts.length > 1 && words.slice(i, i + parts.length).join(' ') === f) {
        matched = f
        break
      }
    }
    if (!matched && FILLERS.includes(words[i])) matched = words[i]
    if (matched) {
      byType[matched] = (byType[matched] || 0) + 1
      i += matched.split(' ').length
    } else {
      i += 1
    }
  }
  const total = Object.values(byType).reduce((a, b) => a + b, 0)
  return { total, byType }
}

export function wordsPerMinute(wordCount, durationSec) {
  if (!durationSec || durationSec <= 0) return 0
  return Math.round((wordCount / durationSec) * 60)
}

export function paceVerdict(wpm) {
  if (!wpm) return 'unknown'
  if (wpm < PACE.min) return 'too_slow'
  if (wpm > PACE.max) return 'too_fast'
  return 'good'
}

export function fillerRate(count, durationSec) {
  if (!durationSec || durationSec <= 0) return 0
  return Math.round((count / durationSec) * 60 * 10) / 10
}

/**
 * Pauses: split the attempt into `wordCount` words over `durationSec` and use
 * either real word timings (when the ASR provides them) or the average gap to
 * estimate. Returns the number of gaps longer than PAUSE_THRESHOLD_S.
 */
export function pauseStats({ wordTimings, wordCount, durationSec }) {
  if (Array.isArray(wordTimings) && wordTimings.length > 1) {
    let pauses = 0
    let longest = 0
    for (let i = 1; i < wordTimings.length; i++) {
      const gap = wordTimings[i] - wordTimings[i - 1]
      if (gap >= PAUSE_THRESHOLD_S) pauses += 1
      if (gap > longest) longest = gap
    }
    return { pauses, longestPause: Math.round(longest * 100) / 100, estimated: false }
  }
  // Fallback: average inter-word gap. If it exceeds the threshold the speaker is
  // pausing/dragging somewhere, even though we cannot pin the exact spots.
  if (!wordCount || wordCount < 2 || !durationSec) {
    return { pauses: 0, longestPause: 0, estimated: true }
  }
  const avgGap = durationSec / wordCount
  const pauses = avgGap >= PAUSE_THRESHOLD_S ? Math.max(1, Math.round(wordCount / 20)) : 0
  return { pauses, longestPause: Math.round(avgGap * 100) / 100, estimated: true }
}

/**
 * Intonation variety from a series of pitch samples (Hz). A monotone voice has a
 * tiny pitch range; an expressive one moves several semitones. Returns 0-100.
 */
export function pitchStats(hzSamples) {
  const vals = (hzSamples || []).filter((v) => v > 0)
  if (vals.length < 4) return null
  const logs = vals.map((v) => Math.log2(v))
  const mean = logs.reduce((a, b) => a + b, 0) / logs.length
  const variance = logs.reduce((a, b) => a + (b - mean) ** 2, 0) / logs.length
  const stdSemitones = Math.sqrt(variance) * 12
  const lo = Math.min(...vals)
  const hi = Math.max(...vals)
  // ~1.5 semitones of movement is flat; ~5+ is expressive.
  const variety = clamp(Math.round((stdSemitones - 1.5) * (100 / 4)), 0, 100)
  return {
    meanHz: Math.round(Math.pow(2, mean)),
    lowHz: Math.round(lo),
    highHz: Math.round(hi),
    stdSemitones: Math.round(stdSemitones * 100) / 100,
    variety
  }
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n))
}

/**
 * Composite 0-100 "clarity" score from the delivery signals we can measure
 * reliably on-device. Pace and fillers are weighted most; intonation is folded
 * in when available and the weights renormalised when it is not. Honest about
 * meaning: this is a *delivery* score, not phoneme accuracy.
 */
export function clarityScore({ wpm, fillerPerMinute, pitchVariety }) {
  // Nothing measurable was said — no words, or no duration. Score 0, don't
  // reward silence with a mid-range number.
  if (!wpm) return 0
  const pacePart = clamp(100 - (Math.abs(wpm - PACE.target) / PACE.target) * 160, 0, 100)
  const fillerPart = clamp(100 - fillerPerMinute * 22, 0, 100)
  let score
  if (pitchVariety == null) {
    score = pacePart * 0.5 + fillerPart * 0.5
  } else {
    score = pacePart * 0.4 + fillerPart * 0.35 + pitchVariety * 0.25
  }
  return Math.round(score)
}

export function analyze({ transcript, durationSec, pitchHz, wordTimings }) {
  const words = tokenize(transcript)
  const wordCount = words.length
  const { total: fillerCount, byType } = countFillers(transcript)
  const wpm = wordsPerMinute(wordCount, durationSec)
  const fpm = fillerRate(fillerCount, durationSec)
  const pitch = pitchStats(pitchHz)
  const pauses = pauseStats({ wordTimings, wordCount, durationSec })
  const score = clarityScore({ wpm, fillerPerMinute: fpm, pitchVariety: pitch ? pitch.variety : null })
  return {
    wordCount,
    durationSec: Math.round(durationSec * 10) / 10,
    wpm,
    pace: paceVerdict(wpm),
    fillerCount,
    fillerByType: byType,
    fillerPerMinute: fpm,
    pitch,
    pauses,
    score
  }
}

/** One actionable, specific suggestion — the "choose ONE change" step. */
export function topSuggestion(result) {
  if (!result || !result.wordCount) {
    return 'We could not hear enough speech. Try again, a little closer to the mic.'
  }
  if (result.fillerCount >= 4 || result.fillerPerMinute >= 6) {
    const worst = Object.entries(result.fillerByType).sort((a, b) => b[1] - a[1])[0]
    return `Cut the fillers — "${worst[0]}" came up ${worst[1]}×. Replace it with a short silence.`
  }
  if (result.pace === 'too_fast') return 'Slow down ~10%. Land the ends of your sentences instead of rushing them.'
  if (result.pace === 'too_slow') return 'Lift the pace a little; keep the energy moving forward.'
  if (result.pitch && result.pitch.variety < 25) return 'Add pitch variety — go up on the last word before a pause so you sound confident, not flat.'
  return 'Solid delivery. Now push the articulation drills — hit every final consonant.'
}

export function renderSummary(result) {
  const lines = [
    `Clarity ${result.score}/100`,
    `${result.wordCount} words in ${result.durationSec}s (${result.wpm} wpm, ${result.pace})`,
    `Fillers: ${result.fillerCount} (${result.fillerPerMinute}/min)`
  ]
  if (result.pitch) lines.push(`Intonation variety: ${result.pitch.variety}/100`)
  lines.push(`Pauses: ${result.pauses.pauses}${result.pauses.estimated ? ' (estimated)' : ''}`)
  lines.push('', topSuggestion(result))
  return lines.join('\n')
}
