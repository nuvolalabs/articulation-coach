import { useState } from 'react'
import SessionView from './components/SessionView.jsx'
import DrillsView from './components/DrillsView.jsx'
import PlanView from './components/PlanView.jsx'
import ProgressView from './components/ProgressView.jsx'
import { loadSessions } from './lib/storage.js'

const TABS = [
  { id: 'session', label: 'Session' },
  { id: 'progress', label: 'Progress' },
  { id: 'plan', label: 'Plan' },
  { id: 'drills', label: 'Drills' }
]

export default function App() {
  const [tab, setTab] = useState('session')
  const [sessions, setSessions] = useState(() => loadSessions())

  function refresh() {
    setSessions(loadSessions())
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-dot" />
          <div>
            <div className="brand-name">Articulation Coach</div>
            <div className="brand-tag">10 minutes a day · speak like a leader</div>
          </div>
        </div>
      </header>

      <main className="content">
        {tab === 'session' && <SessionView sessions={sessions} onSaved={refresh} />}
        {tab === 'progress' && <ProgressView sessions={sessions} onReset={refresh} />}
        {tab === 'plan' && <PlanView sessions={sessions} />}
        {tab === 'drills' && <DrillsView />}
      </main>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'tab active' : 'tab'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
