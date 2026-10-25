import { useState } from 'react'
import SessionView from './components/SessionView.jsx'
import DrillsView from './components/DrillsView.jsx'
import PlanView from './components/PlanView.jsx'
import ProgressView from './components/ProgressView.jsx'

const TABS = [
  { id: 'session', label: 'Session' },
  { id: 'progress', label: 'Progress' },
  { id: 'plan', label: 'Plan' },
  { id: 'drills', label: 'Drills' }
]

export default function App({
  sessions = [],
  onSaved,
  onReset,
  user,
  onSignOut,
  syncing = false
}) {
  const [tab, setTab] = useState('session')
  const refresh = onSaved || (() => {})

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
        <div className="topbar-right">
          {syncing && <span className="sync-dot" title="Syncing…" />}
          {user?.email && <span className="who" title={user.email}>{user.email}</span>}
          {onSignOut && (
            <button className="btn ghost small" onClick={onSignOut}>Sign out</button>
          )}
        </div>
      </header>

      <main className="content">
        {tab === 'session' && <SessionView sessions={sessions} onSaved={refresh} />}
        {tab === 'progress' && <ProgressView sessions={sessions} onReset={onReset || refresh} />}
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
