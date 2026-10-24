// Serverless pronunciation-scoring endpoint (the "differentiator" integration point).
//
// The MVP computes delivery metrics (pace, fillers, intonation) entirely on the
// client. Phoneme-level *articulation accuracy* needs a pronunciation-assessment
// model (e.g. Azure Speech "Pronunciation Assessment", which returns
// accuracy/fluency/completeness plus per-phoneme scores). That model must run
// server-side so the key never reaches the browser — this is that endpoint.
//
// It is deliberately NOT wired into the MVP UI: the phoneme feature is gated
// behind validating cost + native-speaker accuracy first (see the product spec,
// §14 "Risks"). When AZURE_SPEECH_KEY + AZURE_SPEECH_REGION are configured this
// returns real scores; otherwise it returns 501 so the client falls back to the
// on-device delivery metrics rather than showing fake numbers.

export const config = { runtime: 'nodejs' }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }
  const key = process.env.AZURE_SPEECH_KEY
  const region = process.env.AZURE_SPEECH_REGION
  if (!key || !region) {
    res.status(501).json({
      error: 'phoneme_scoring_not_configured',
      detail:
        'Set AZURE_SPEECH_KEY + AZURE_SPEECH_REGION to enable server-side ' +
        'phoneme scoring. The client uses on-device delivery metrics meanwhile.'
    })
    return
  }
  // NOTE: audio upload + Azure Pronunciation Assessment wiring goes here.
  // Kept as an explicit stub so the endpoint contract is stable and the
  // feature is honest about what is and is not implemented.
  res.status(501).json({ error: 'not_implemented', detail: 'Phoneme scoring is not wired yet.' })
}
