// Supabase client. The publishable key is designed to be public (it ships in the
// browser bundle); row-level security in Postgres is what actually protects data.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env?.VITE_SUPABASE_URL
const key = import.meta.env?.VITE_SUPABASE_PUBLISHABLE

export const supabaseReady = Boolean(url && key)

export const supabase = supabaseReady
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null
