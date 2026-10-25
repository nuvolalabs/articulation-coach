import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseReady } from './supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(supabaseReady)

  useEffect(() => {
    if (!supabaseReady) return
    let alive = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!alive) return
        setSession(data.session ?? null)
        setLoading(false)
      })
      .catch(() => alive && setLoading(false))

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (alive) setSession(next ?? null)
    })

    return () => {
      alive = false
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  const value = {
    ready: supabaseReady,
    loading,
    session,
    user: session?.user ?? null,
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut()
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
