import React from 'react'
import { createRoot } from 'react-dom/client'
import { initCMS } from '../../client-sdk/src/index.js'
import App from './App.jsx'
import './index.css'

// ─── 1. Initialise the CMS SDK once at the app root ───────────────────────
initCMS(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

createRoot(document.getElementById('root')).render(<App />)
