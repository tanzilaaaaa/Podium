/**
 * api.js — thin client for the Go backend.
 * Every request attaches the Firebase ID token automatically.
 */

import { auth } from './firebase'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request(method, path, body) {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')

  const token = await user.getIdToken()

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg = data?.error || `Request failed: ${res.status}`
    throw new Error(msg)
  }

  return data
}

const get   = (path)        => request('GET',   path)
const post  = (path, body)  => request('POST',  path, body)
const patch = (path, body)  => request('PATCH', path, body)

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Call once after every Firebase login/signup.
 * Creates the user row in Postgres if it doesn't exist yet.
 */
export async function syncUser(displayName = '') {
  return post('/api/v1/auth/sync', { displayName })
}

// ─── User profile ─────────────────────────────────────────────────────────────

export async function getMe() {
  return get('/api/v1/users/me')
}

export async function updateMe(fields) {
  // fields: { displayName?, goals?, onboardingDone? }
  return patch('/api/v1/users/me', fields)
}

// ─── Reps ─────────────────────────────────────────────────────────────────────

/**
 * Submit a completed recording.
 * Scoring happens server-side — just send transcript + duration.
 * Returns { rep, newXp, newLevel, newStreak, leveledUp, xpEarned, newBadges }
 */
export async function submitRep({ promptId, promptText, category, audioDurationSec, transcript }) {
  return post('/api/v1/reps', {
    promptId:        promptId || '',
    promptText:      promptText || '',
    category:        category || '',
    audioDurationSec,
    transcript:      transcript || '',
  })
}

export async function getReps(limit = 30) {
  return get(`/api/v1/reps?limit=${limit}`)
}

// ─── Badges ───────────────────────────────────────────────────────────────────

export async function getBadges() {
  return get('/api/v1/badges')
}
