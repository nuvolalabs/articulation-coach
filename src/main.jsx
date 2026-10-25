import React from 'react'
import { createRoot } from 'react-dom/client'
import Root from './Root.jsx'
import { AuthProvider } from './lib/auth.jsx'
import './styles.css'
import './auth.css'

// Expose the pure modules for automated verification (used by the smoke test).
import * as analysis from './lib/analysis.js'
import * as drills from './lib/drills.js'
import * as storage from './lib/storage.js'
import * as prompts from './lib/prompts.js'

window.__articulate = { analysis, drills, storage, prompts }

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </React.StrictMode>
)
