import { DRILLS, PHASES } from '../lib/drills.js'

export default function DrillsView() {
  const order = ['breath', 'warmup', 'drill']
  return (
    <div className="drills">
      <h2>Drill library</h2>
      <p className="muted">
        Precision first, speed second. Speed up only when every sound stays crisp.
      </p>
      {order.map((phase) => (
        <section key={phase} className="drill-section">
          <h3>{PHASES[phase].label}</h3>
          {DRILLS.filter((d) => d.phase === phase).map((d) => (
            <div key={d.id} className="card drill-card">
              <div className="drill-head">
                <span className="drill-name">{d.name}</span>
                {d.tags.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
              <p className="muted">{d.how}</p>
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
