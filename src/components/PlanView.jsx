import { CURRICULUM, MONTH_LABELS, weekForDay } from '../lib/drills.js'
import { programmeDay } from '../lib/storage.js'

export default function PlanView({ sessions }) {
  const day = programmeDay(sessions)
  const current = weekForDay(day)
  const months = [1, 2, 3]

  return (
    <div className="plan">
      <h2>Your 3-month programme</h2>
      <p className="muted">
        You’re on <strong>day {day}</strong>, week {current.week} of 12. Days 1–30 build the
        habit (median habit automaticity is ~66 days), so keep sessions short and daily.
      </p>

      {months.map((m) => (
        <section key={m} className="month">
          <h3>{MONTH_LABELS[m]}</h3>
          <div className="weeks">
            {CURRICULUM.filter((w) => w.month === m).map((w) => (
              <div key={w.week} className={w.week === current.week ? 'card week active' : 'card week'}>
                <div className="week-head">
                  <span className="week-no">Week {w.week}</span>
                  {w.week === current.week && <span className="badge">now</span>}
                </div>
                <div className="week-focus">{w.focus}</div>
                <div className="muted">{w.milestone}</div>
                <div className="week-targets">Drills: {w.target.join(', ')}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
