import { topSuggestion } from '../lib/analysis.js'

function Ring({ value }) {
  const r = 34
  const c = 2 * Math.PI * r
  const off = c * (1 - (value || 0) / 100)
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" className="ring">
      <circle cx="40" cy="40" r={r} className="ring-bg" />
      <circle
        cx="40" cy="40" r={r}
        className="ring-fg"
        strokeDasharray={c}
        strokeDashoffset={off}
      />
      <text x="40" y="46" textAnchor="middle" className="ring-text">{value || 0}</text>
    </svg>
  )
}

export default function MetricsCard({ result, playbackUrl, compare, onSave, onRetry, saved, saving, error }) {
  if (!result) return null
  const delta = compare && typeof compare.score === 'number'
    ? result.score - compare.score
    : null

  return (
    <div className="card metrics">
      <div className="metrics-head">
        <Ring value={result.score} />
        <div>
          <div className="metrics-title">Clarity score</div>
          <div className="muted">
            {result.wordCount} words · {result.durationSec}s · {result.wpm} wpm ({result.pace})
          </div>
          {delta !== null && (
            <div className={delta >= 0 ? 'delta up' : 'delta down'}>
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} vs previous attempt
            </div>
          )}
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-v">{result.fillerCount}</div>
          <div className="stat-l">fillers ({result.fillerPerMinute}/min)</div>
        </div>
        <div className="stat">
          <div className="stat-v">{result.pauses.pauses}{result.pauses.estimated ? '*' : ''}</div>
          <div className="stat-l">pauses{result.pauses.estimated ? ' (est.)' : ''}</div>
        </div>
        <div className="stat">
          <div className="stat-v">{result.pitch ? result.pitch.variety : '—'}</div>
          <div className="stat-l">intonation variety</div>
        </div>
      </div>

      <div className="suggestion">
        <span className="suggestion-label">Your one change</span>
        <p>{topSuggestion(result)}</p>
      </div>

      {playbackUrl && (
        <audio className="playback" controls src={playbackUrl} />
      )}

      {error && <p className="auth-error">{error}</p>}

      <div className="row">
        <button className="btn ghost" onClick={onRetry} disabled={saving}>Try again</button>
        <button className="btn" onClick={onSave} disabled={saved || saving}>
          {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save & finish'}
        </button>
      </div>
    </div>
  )
}
