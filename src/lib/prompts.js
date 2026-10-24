// Prompt packs — what the user actually speaks to in the "Speak & record" block.
// Corporate and sales packs are the product's reason for existing (the "speak
// like a leader" use case); the articulation pack feeds the drill work.

export const PACKS = {
  corporate: {
    label: 'Corporate meetings',
    prompts: [
      'Give a 60-second project update: status, risk, next step.',
      'Explain a decision you made this week and why.',
      'Disagree with a proposal — respectfully and with a reason.',
      'Answer a stakeholder who asks "why is this taking so long?"',
      'Kick off a meeting in 30 seconds and state the goal.',
      'Deliver a status update that includes a blocker and a plan.',
      'Give feedback to a teammate on work that missed the mark.',
      'Summarise a long discussion into 3 points for a busy exec.'
    ]
  },
  sales: {
    label: 'Sales & pitches',
    prompts: [
      'Open a discovery call in 30 seconds and earn the next 5 minutes.',
      'Reframe the customer\'s problem so they see it a new way (Challenger).',
      'Deliver your 30-second value proposition.',
      'Handle the objection: "It\'s too expensive."',
      'Ask a SPIN implication question that reveals the cost of inaction.',
      'Close the call with a clear, specific next step.',
      'Tell a 45-second customer story with a before/after.',
      'Pitch to a room and land one memorable line.'
    ]
  },
  articulation: {
    label: 'Articulation drill',
    prompts: [
      'Read this aloud, hitting every final sound: "We needed to submit the report by Friday."',
      'Say slowly and crisply: "Thirty-three thick thistles."',
      'Say three times, precision first: "Red lorry, yellow lorry."',
      'Say with distinct sh/s: "She sells seashells by the seashore."',
      'Read an opening paragraph of anything, over-articulating every movement.',
      'Say "pa-ta-ka, ba-da-ga" slowly, then faster, keeping every sound crisp.'
    ]
  }
}

export function packPrompts(packId) {
  return (PACKS[packId] || PACKS.corporate).prompts
}

/** Deterministic-enough rotation so the app suggests variety without repeats. */
export function pickPrompt(packId, seed) {
  const list = packPrompts(packId)
  const i = Math.abs(Math.floor(seed || Date.now())) % list.length
  return list[i]
}
