import { useState } from 'react'
import { useAuth } from '../lib/auth.jsx'

const MIN_PASSWORD = 6

/** Presentational form — kept separate from the auth context so it is testable. */
export function AuthForm({ onSubmitSignIn, onSubmitSignUp, busy, error, info }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [local, setLocal] = useState('')

  const isSignUp = mode === 'signup'

  async function submit(e) {
    e.preventDefault()
    setLocal('')
    if (!email.includes('@')) return setLocal('Enter a valid email address.')
    if (password.length < MIN_PASSWORD) return setLocal(`Password must be at least ${MIN_PASSWORD} characters.`)
    const fn = isSignUp ? onSubmitSignUp : onSubmitSignIn
    await fn(email.trim(), password)
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="auth-tabs">
        <button type="button" className={!isSignUp ? 'auth-tab active' : 'auth-tab'} onClick={() => { setMode('signin'); setLocal('') }}>
          Sign in
        </button>
        <button type="button" className={isSignUp ? 'auth-tab active' : 'auth-tab'} onClick={() => { setMode('signup'); setLocal('') }}>
          Create account
        </button>
      </div>

      <label className="auth-field">
        <span>Email</span>
        <input type="email" autoComplete="email" value={email} placeholder="you@work.com"
               onChange={(e) => setEmail(e.target.value)} />
      </label>

      <label className="auth-field">
        <span>Password</span>
        <input type="password" autoComplete={isSignUp ? 'new-password' : 'current-password'} value={password}
               placeholder={`At least ${MIN_PASSWORD} characters`}
               onChange={(e) => setPassword(e.target.value)} />
      </label>

      {(local || error) && <p className="auth-error">{local || error}</p>}
      {info && <p className="auth-info">{info}</p>}

      <button className="btn auth-submit" type="submit" disabled={busy}>
        {busy ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
      </button>

      <p className="muted small">
        {isSignUp
          ? 'Your practice history is private to your account.'
          : 'New here? Tap “Create account”.'}
      </p>
    </form>
  )
}

export default function AuthGate() {
  const { signIn, signUp } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const wrap = (fn) => async (email, password) => {
    setBusy(true)
    setError('')
    setInfo('')
    try {
      const { error: err } = await fn(email, password)
      if (err) setError(err.message)
      else if (fn === signUp) setInfo('Account created — signing you in…')
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="brand auth-brand">
          <span className="brand-dot" />
          <div>
            <div className="brand-name">Articulation Coach</div>
            <div className="brand-tag">10 minutes a day · speak like a leader</div>
          </div>
        </div>
        <AuthForm
          onSubmitSignIn={wrap(signIn)}
          onSubmitSignUp={wrap(signUp)}
          busy={busy}
          error={error}
          info={info}
        />
      </div>
    </div>
  )
}
