import { useEffect, useMemo, useState } from 'react'
import Recorder from './Recorder.jsx'
import MetricsCard from './MetricsCard.jsx'
import { DRILLS, drillById, weekForDay } from '../lib/drills.js'
import { PACKS, pickPrompt } from '../lib/prompts.js'
import { saveSession, programmeDay } from '../lib/storage.js'

const BLOCKS = [
  { id: 'breath', title: 'Breath', seconds: 60,
    intro: 'Calm, steady air is what finishes your sentences.',
    drills: ['breath-box', 'breath-hiss', 'breath-diaphragm'] },
  { id: 'warmup', title: 'Warm-up', seconds: 180,
    intro: 'Wake up the articulators — jaw, lips and tongue.',
    drills: ['warm-jaw', 'warm-lips', 'warm-eeoo', 'warm-tongue', 'warm-pataka'] },
  { id: 'drill', title: 'Precision drill', seconds: 180,
    intro: 'Precision first, speed second. Speed up only when every sound stays crisp.',
    drills: [] }, // filled from this week's targets
  { id: 'speak', title: 'Speak & record', seconds: 180,
    intro: 'Speak out loud, record it, then make ONE change and go again.',
    drills: [] }
]

export default function SessionView({ sessions, onSaved }) {
  const day = useMemo(() => programmeDay(sessions), [sessions])
  const week = useMemo(() => weekForDay(day), [day])
  const targetIds = week ? week.target : ['last-sound']

  const [step, setStep] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(BLOCKS[0].seconds)
  const [running, setRunning] = useState(false)
  const [drillPick, setDrillPick] = useState({ breath: 0, warmup: 0, drill: 0 })
  const [pack, setPack] = useState('corporate')
  const [promptSeed, setPromptSeed] = useState(() => Date.now())
  const [attempt, setAttempt] = useState(null) // {result, playbackUrl, transcript}
  const [compare, setCompare] = useState(null)
  const [saved, setSaved] = useState(false)

  const block = BLOCKS[step]
  const drillOptions = block.id === 'drill'
    ? targetIds.map(drillById).filter(Boolean)
    : block.drills.map(drillById).filter(Boolean)
  const activeDrill = drillOptions[drillPick[block.id] % (drillOptions.length || 1)]
  const prompt = useMemo(() => pickPrompt(pack, promptSeed), [pack, promptSeed])

  useEffect(() => { setSecondsLeft(block.seconds); setRunning(false) }, [step])

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { setRunning(false); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [running])

  function onAttempt(a) {
    setCompare(attempt ? attempt.result : null)
    setAttempt(a)
    setSaved(false)
  }

  function save() {
    saveSession({
      kind: 'session',
      week: week ? week.week : 1,
      day,
      drill: activeDrill ? activeDrill.id : null,
      pack,
      prompt,
      score: attempt.result.score,
      wpm: attempt.result.wpm,
      fillerCount: attempt.result.fillerCount,
      transcript: attempt.transcript
    })
    setSaved(true)
    onSaved()
  }

  const pct = block.seconds ? Math.round(100 * (1 - secondsLeft / block.seconds)) : 0

  return (
    <div className="session">
      <div className="stepper">
        {BLOCKS.map((b, i) => (
          <div key={b.id} className={
            i === step ? 'step active' : i < step ? 'step done' : 'step'
          }>
            {b.title}
          </div>
        ))}
      </div>

      <div className="card block-card">
        <div className="block-head">
          <h2>{block.title}</h2>
          <div className="block-meta">Week {week ? week.week : 1} · Day {day}</div>
        </div>
        <p className="muted">{block.intro}</p>

        {block.id === 'speak' && (
          <>
            <div className="chips">
              {Object.entries(PACKS).map(([id, p]) => (
                <button key={id} className={pack === id ? 'chip active' : 'chip'}
                        onClick={() => { setPack(id); setPromptSeed(Date.now()) }}>
                  {p.label}
                </button>
              ))}
              <button className="chip" onClick={() => setPromptSeed(Date.now())}>↻ New prompt</button>
            </div>
            <Recorder prompt={prompt} onAttempt={onAttempt} />
            {attempt && (
              <MetricsCard
                result={attempt.result}
                playbackUrl={attempt.playbackUrl}
                compare={compare}
                saved={saved}
                onSave={save}
                onRetry={() => { setAttempt(null); setCompare(null) }}
              />
            )}
          </>
        )}

        {block.id !== 'speak' && activeDrill && (
          <>
            <div className="drill-now">
              <div className="drill-now-name">{activeDrill.name}</div>
              <div className="muted">{activeDrill.how}</div>
            </div>
            {drillOptions.length > 1 && (
              <div className="chips">
                {drillOptions.map((d, i) => (
                  <button key={d.id}
                          className={drillPick[block.id] % drillOptions.length === i ? 'chip active' : 'chip'}
                          onClick={() => setDrillPick((p) => ({ ...p, [block.id]: i }))}>
                    {d.name}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <div className="timer-row">
          <div className="bar"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
          <div className="clock">{String(Math.floor(secondsLeft / 60))}:{String(secondsLeft % 60).padStart(2, '0')}</div>
          <button className="btn ghost small" onClick={() => setRunning((r) => !r)}>
            {running ? 'Pause' : 'Start'}
          </button>
        </div>

        <div className="row">
          <button className="btn ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</button>
          {step < BLOCKS.length - 1
            ? <button className="btn" onClick={() => setStep((s) => s + 1)}>Next block →</button>
            : <button className="btn ghost" onClick={() => { setStep(0); setAttempt(null); setCompare(null) }}>Finish session</button>}
        </div>
      </div>

      {week && (
        <div className="card milestone">
          <div className="milestone-label">This week’s milestone — {week.focus}</div>
          <div>{week.milestone}</div>
        </div>
      )}
    </div>
  )
}
