import { useCallback, useEffect, useState } from 'react'
import App from './App.jsx'
import AuthGate from './components/AuthGate.jsx'
import { useAuth } from './lib/auth.jsx'
import { cachedSessions, clearAllSessions, listSessions } from './lib/datastore.js'

function Splash({ text }) {
  return (
    <div className="splash">
      <div className="brand-dot" />
      <p className="muted">{text}</p>
    </div>
  )
}

/** Wires auth + remote data around the presentational <App />. */
export default function Root() {
  const { ready, loading, session, user, signOut } = useAuth()
  const [sessions, setSessions] = useState(() => cachedSessions())
  const [syncing, setSyncing] = useState(false)

  const refresh = useCallback(async () => {
    if (!session) return
    setSyncing(true)
    try {
      setSessions(await listSessions())
    } catch (e) {
      console.warn('Could not sync sessions:', e.message)
    } finally {
      setSyncing(false)
    }
  }, [session])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (!ready) {
    return (
      <Splash text="Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE, then rebuild." />
    )
  }
  if (loading) return <Splash text="Loading…" />
  if (!session) return <AuthGate />

  return (
    <App
      sessions={sessions}
      syncing={syncing}
      user={user}
      onSignOut={signOut}
      onSaved={refresh}
      onReset={async () => {
        await clearAllSessions()
        setSessions([])
      }}
    />
  )
}
