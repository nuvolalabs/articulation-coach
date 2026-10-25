import { summarise, clarityTrend } from '../lib/storage.js'

function Sparkline({ points }) {
  if (!points.length) return null
  const w = 300
  const h = 70
  const scores = points.map((p) => p.score)
  const min = Math.min(...scores, 0)
  const max = Math.max(...scores, 100)
  const span = Math.max(1, max - min)
  const step = points.length > 1 ? w / (points.length - 1) : w
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(h - ((p.score - min) / span) * h).toFixed(1)}`)
    .join(' ')
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path d={path} className="spark-line" />
    </svg>
  )
}

export default function ProgressView({ sessions, onReset }) {
  const s = summarise(sessions)
  const trend = clarityTrend(sessions)
  const recent = [...sessions].sort((a, b) => b.ts - a.ts).slice(0, 8)

  async function reset() {
    if (!window.confirm('Delete all your saved sessions? This cannot be undone.')) return
    await onReset?.()
  }

  return (
    <div className="progress">
      <h2>Progress</h2>

      <div className="stat-grid big">
        <div className="stat card">
          <div className="stat-v">{s.avgScore}</div>
          <div className="stat-l">avg clarity</div>
        </div>
        <div className="stat card">
          <div className={s.delta >= 0 ? 'stat-v up' : 'stat-v down'}>
            {s.delta >= 0 ? '+' : ''}{s.delta}
          </div>
          <div className="stat-l">trend (first→latest)</div>
        </div>
        <div className="stat card">
          <div className="stat-v">{s.streak}</div>
          <div className="stat-l">day streak</div>
        </div>
        <div className="stat card">
          <div className="stat-v">{s.compliance.rate}%</div>
          <div className="stat-l">30-day compliance</div>
        </div>
      </div>

      <div className="card">
        <div className="metrics-title">Clarity over time</div>
        {trend.length > 1
          ? <Sparkline points={trend} />
          : <p className="muted">Do a couple of sessions and your trend appears here.</p>}
        <p className="muted small">
          {s.compliance.practised} of {s.compliance.windowDays} days practised
          (+{s.compliance.grace} grace days counted). We track compliance, not a brittle
          streak — one miss is data, not failure.
        </p>
      </div>

      <div className="card">
        <div className="metrics-title">Recent attempts</div>
        {recent.length === 0 && <p className="muted">No sessions yet — start with the Session tab.</p>}
        {recent.map((r) => (
          <div key={r.id} className="recent-row">
            <span className="recent-score">{r.score}</span>
            <span className="recent-when">{new Date(r.ts).toLocaleDateString()}</span>
            <span className="muted ellipsis">{r.prompt}</span>
          </div>
        ))}
      </div>

      <button className="btn ghost small" onClick={reset}>Reset my data</button>
    </div>
  )
}
