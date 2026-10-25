# Articulation Coach

**The 10-minute-a-day articulation gym for professionals.** Speak clearly, sound
authoritative, and own the room in corporate meetings and sales pitches — with proof
you're improving.

**Live:** https://articulation-coach-mu.vercel.app

A mobile-first PWA built from the evidence synthesis in
[`RESEARCH_AND_SPEC.md`](../articulation-coach/RESEARCH_AND_SPEC.md) (49 cited sources).

## What it does

- **Guided 10-minute daily session** — the structure that recurs across the research:
  1 min breath → 3 min mouth warm-ups → 3 min precision drill → 3 min speak & record.
- **Record → analyse → one change → repeat** — the feedback loop that makes articulation
  training work (you can't hear your own errors in real time).
- **On-device speech analysis:** pace (wpm), filler words, pauses, and intonation variety
  from live pitch tracking, rolled into a single **clarity score**.
- **Drill library** — box breathing, diaphragm check, jaw/lip/tongue warm-ups, `pa-ta-ka`,
  phoneme-targeted tongue twisters (r/l, th, sh/s), the Last-Sound technique, pencil-
  resistance reading, over-articulation, ending-sound reading and shadowing.
- **3-month curriculum** — a 12-week progression (foundation → delivery → transfer) with
  weekly milestones, matched to the honest timeline (hear it in 2 weeks, others notice in
  6, automatic by month 3).
- **Forgiving habit system** — a 30-day *compliance rate* (not a brittle streak) with a
  weekly grace day, because the median app streak dies at 4 days.

## Accounts & sync

Sign in with **email + password** (Supabase Auth). Your practice history is stored
per-account in Postgres and protected by row-level security, so only you can read or
write your own rows. A copy is cached in `localStorage` so the installed PWA still shows
your progress offline; it re-syncs when you're back online.

## The honest bit

The clarity score measures **delivery** (pace, fillers, intonation) — signals we can
compute reliably on-device. **Phoneme-level articulation accuracy** is the product's
differentiator but needs a pronunciation-assessment model; `api/score.js` is the
serverless integration point, deliberately *not* wired into the UI until cost and
native-speaker accuracy are validated (see spec §14). The app never shows fake numbers —
when phoneme scoring isn't configured it falls back to delivery metrics.

## Run locally

```bash
# 1. point the app at Supabase (see .env.local for the values)
echo "VITE_SUPABASE_URL=https://<ref>.supabase.co"        >  .env.local
echo "VITE_SUPABASE_PUBLISHABLE=sb_publishable_<key>"     >> .env.local

npm install
npm run dev        # http://localhost:5173
npm test           # 56 tests: analysis core, progress maths, auth form, UI
npm run build      # production build
npm run preview    # serve the build on :4175
npm run icons      # regenerate the PWA PNG icons
```

Schema + RLS live in `supabase/sessions.sql` — apply it once per Supabase project.

Best in Chrome/Edge/Safari (they support the Web Speech API for live transcription).
Recording, playback and pitch analysis work in any browser with `MediaRecorder`.

## Architecture

```
src/
  lib/analysis.js   pure, tested scoring: fillers, wpm, pauses, pitch, clarity score
  lib/audio.js      MediaRecorder + Web Audio autocorrelation pitch tracking
  lib/speech.js     Web Speech API wrapper (graceful when unsupported)
  lib/drills.js     the drill library + 12-week curriculum
  lib/prompts.js    corporate / sales / articulation prompt packs
  lib/storage.js    pure progress maths (compliance/streak/trend) — clock-driven
  lib/supabase.js   Supabase client (publishable key, RLS-protected)
  lib/auth.jsx      AuthProvider / useAuth (session + sign-in/up/out)
  lib/datastore.js  per-user session CRUD + offline localStorage cache
  Root.jsx          composes auth + remote data around the presentational App
  components/       AuthGate, SessionView, Recorder, MetricsCard, ProgressView, PlanView, DrillsView
supabase/sessions.sql  sessions table + row-level security policies
scripts/gen_icons.py   PWA PNG icons (stdlib only, no Pillow)
api/score.js        serverless phoneme-scoring endpoint (integration point / stub)
```

## Deploy (Vercel)

```bash
vercel --prod
```

`vercel.json` rewrites everything to `index.html` (SPA); `/api/*` files deploy as
functions automatically. Vite inlines `VITE_*` vars at build time, so set them on the
Vercel project (production + preview) before building:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE` (public-safe — RLS is the real protection)

Set `AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION` only when enabling phoneme scoring.

## Data & privacy

**Audio never leaves the device** — recording, playback and pitch analysis all happen in
the browser; only the resulting *metrics* (score, wpm, filler count, prompt, and the
optional transcript) are saved to your account. Rows are scoped by row-level security to
your `auth.uid()`, so the publishable key in the bundle cannot read anyone else's data.
