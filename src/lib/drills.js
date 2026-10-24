// The drill library and the 3-month curriculum (the product's core IP).
// Content is drawn from the evidence synthesis in RESEARCH_AND_SPEC.md.

export const PHASES = {
  breath: { label: 'Breath', minutes: 1 },
  warmup: { label: 'Warm-up', minutes: 3 },
  drill: { label: 'Precision drill', minutes: 3 },
  speak: { label: 'Speak & record', minutes: 3 }
}

export const DRILLS = [
  // --- Breath ---------------------------------------------------------------
  { id: 'breath-box', phase: 'breath', name: 'Box breathing',
    how: 'Breathe in 4, hold 4, out 4, hold 4. Four rounds. Steadies the air that finishes your sentences.', tags: ['breath'] },
  { id: 'breath-hiss', phase: 'breath', name: 'Hissing exhale',
    how: 'Breathe in low, then release on a steady "sss" as long as is comfortable. Trains a steady air stream.', tags: ['breath'] },
  { id: 'breath-diaphragm', phase: 'breath', name: 'Diaphragm check',
    how: 'Hand on belly. In through the nose, belly swells; speak only as the belly comes back in. Never speak on held breath.', tags: ['breath', 'presence'] },

  // --- Warm-up --------------------------------------------------------------
  { id: 'warm-jaw', phase: 'warmup', name: 'Jaw release',
    how: 'Let the jaw hang open, move it gently side to side 10×. Mumblers often speak through a nearly closed jaw.', tags: ['articulators'] },
  { id: 'warm-lips', phase: 'warmup', name: 'Lip trills',
    how: 'Blow air through loose lips so they flutter, sliding pitch up and down, ~10s.', tags: ['articulators'] },
  { id: 'warm-eeoo', phase: 'warmup', name: '"Ee–oo" stretches',
    how: 'Alternate a wide smile ("ee") and a tight pucker ("oo") 10×, exaggerating both.', tags: ['articulators'] },
  { id: 'warm-tongue', phase: 'warmup', name: 'Tongue circles',
    how: 'Mouth closed, run the tongue around the outside of the teeth 5× each way.', tags: ['articulators'] },
  { id: 'warm-pataka', phase: 'warmup', name: 'pa-ta-ka',
    how: 'Repeat "pa-ta-ka" slowly, then faster, keeping every sound crisp (lips → tongue tip → back). Then "ba-da-ga".', tags: ['articulators'] },

  // --- Precision drills -----------------------------------------------------
  { id: 'tw-rl', phase: 'drill', name: 'Red lorry, yellow lorry', tags: ['r', 'l'],
    how: 'Say it 3× slowly with every consonant crisp, then once at normal speed. Precision first, speed second.' },
  { id: 'tw-th', phase: 'drill', name: 'Thirty-three thick thistles', tags: ['th'],
    how: 'Tongue tip lightly between the teeth for /θ/. 3 clean reps, then 10% faster.' },
  { id: 'tw-shs', phase: 'drill', name: 'She sells seashells', tags: ['sh', 's'],
    how: 'Keep /ʃ/ and /s/ distinct — make each one pop. 3 slow, then 1 normal.' },
  { id: 'tw-bp', phase: 'drill', name: 'Betty bought a bit of butter', tags: ['b', 'p', 't'],
    how: 'Exaggerate the plosives. If a sound distorts, slow back down.' },
  { id: 'last-sound', phase: 'drill', name: 'Last-Sound reading', tags: ['endings'],
    how: 'Read any sentence and make the FINAL sound of every word audible: "We need(d) to submi(t) the repor(t) by Friday." Over-articulate for a week, then normalise.' },
  { id: 'pencil', phase: 'drill', name: 'Pencil resistance reading', tags: ['endings'],
    how: 'Bite gently on a pen held horizontally and read aloud ~2 min. Remove it and read again — note how much sharper you sound.' },
  { id: 'overartic', phase: 'drill', name: 'Over-articulated reading', tags: ['articulators'],
    how: 'Read a passage exaggerating every mouth movement, as if someone across the room is lip-reading.' },
  { id: 'ending-read', phase: 'drill', name: 'Ending-sound reading', tags: ['endings'],
    how: 'Read focusing ONLY on the last sound of each word: the "t" in want, the "d" in and, the "s" in its.' },
  { id: 'shadow', phase: 'drill', name: 'Shadowing', tags: ['rhythm', 'intonation'],
    how: 'Play a short native clip and speak along simultaneously, copying rhythm, stress and intonation. Do not pause the clip.' }
]

export function drillsByPhase(phase) {
  return DRILLS.filter((d) => d.phase === phase)
}

export function drillById(id) {
  return DRILLS.find((d) => d.id === id) || null
}

// The 12-week progression. Each week names a focus, a target drill set and a
// checkable milestone.
export const CURRICULUM = [
  { week: 1, month: 1, focus: 'Baseline + awareness', target: ['last-sound', 'warm-pataka'],
    milestone: 'Record your "before" clip and note your error count for the week.' },
  { week: 2, month: 1, focus: 'Dropped endings', target: ['last-sound', 'pencil'],
    milestone: 'Error count down ~30% vs week 1.' },
  { week: 3, month: 1, focus: 'Th / R-L consonants', target: ['tw-th', 'tw-rl'],
    milestone: 'Your weakest 2 consonant sounds named and drilled daily.' },
  { week: 4, month: 1, focus: 'Consolidate the mouth', target: ['tw-shs', 'overartic'],
    milestone: 'Hear a difference in your own recordings.' },
  { week: 5, month: 2, focus: 'Pace', target: ['ending-read', 'shadow'],
    milestone: 'Hold 120–170 wpm in three attempts.' },
  { week: 6, month: 2, focus: 'Fillers & pauses', target: ['shadow', 'overartic'],
    milestone: 'Fillers under 3 per minute.' },
  { week: 7, month: 2, focus: 'Intonation', target: ['shadow', 'tw-bp'],
    milestone: 'Intonation variety score above 40/100.' },
  { week: 8, month: 2, focus: 'Concision', target: ['ending-read', 'last-sound'],
    milestone: 'Deliver a 60-second update with no filler and a clear point.' },
  { week: 9, month: 3, focus: 'Meeting transfer', target: ['shadow', 'overartic'],
    milestone: 'Cold-prompt a stand-up update and score it.' },
  { week: 10, month: 3, focus: 'Sales transfer', target: ['ending-read', 'shadow'],
    milestone: 'Pitch a 30-second value prop, then handle one objection.' },
  { week: 11, month: 3, focus: 'Pressure', target: ['last-sound', 'tw-th'],
    milestone: 'Answer the same prompt in 90s and again in 45s, staying clear.' },
  { week: 12, month: 3, focus: 'Public test', target: ['shadow', 'overartic'],
    milestone: 'Record your "after" clip and compare it to week 1.' }
]

export function weekForDay(dayNumber) {
  const week = Math.min(12, Math.max(1, Math.ceil((dayNumber || 1) / 7)))
  return CURRICULUM.find((c) => c.week === week)
}

export const MONTH_LABELS = {
  1: 'Month 1 — Foundation (awareness & articulation mechanics)',
  2: 'Month 2 — Delivery (pace, pause, intonation, concision)',
  3: 'Month 3 — Transfer & pressure (meetings & pitches)'
}
