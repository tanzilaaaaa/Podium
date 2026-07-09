import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  increment,
} from 'firebase/firestore'
import { db } from './firebase'

// ─── User ────────────────────────────────────────────────────────────────────

export async function createUserProfile(userId, { displayName, email }) {
  const ref = doc(db, 'users', userId)
  await setDoc(ref, {
    displayName,
    email,
    createdAt: serverTimestamp(),
    xp: 0,
    level: 1,
    streakCount: 0,
    lastRepDate: null,
    streakFreezesAvailable: 1,
    onboardingDone: false,
    goals: [],
  })
}

export async function getUserProfile(userId) {
  const ref = doc(db, 'users', userId)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateUserProfile(userId, data) {
  const ref = doc(db, 'users', userId)
  await updateDoc(ref, data)
}

// ─── Reps ────────────────────────────────────────────────────────────────────

export async function saveRep(userId, repData) {
  const ref = collection(db, 'users', userId, 'reps')
  const docRef = await addDoc(ref, {
    ...repData,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getUserReps(userId, limitCount = 30) {
  const ref = collection(db, 'users', userId, 'reps')
  const q = query(ref, orderBy('createdAt', 'desc'), limit(limitCount))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// ─── Prompts ─────────────────────────────────────────────────────────────────

export async function getPrompts() {
  const ref = collection(db, 'prompts')
  const snap = await getDocs(ref)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// ─── Badges ──────────────────────────────────────────────────────────────────

export async function getAllBadges() {
  const ref = collection(db, 'badges')
  const snap = await getDocs(ref)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getEarnedBadges(userId) {
  const ref = collection(db, 'users', userId, 'badgesEarned')
  const snap = await getDocs(ref)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function awardBadge(userId, badgeId) {
  const ref = doc(db, 'users', userId, 'badgesEarned', badgeId)
  await setDoc(ref, { earnedAt: serverTimestamp() })
}

// ─── Streak & XP logic ───────────────────────────────────────────────────────

/**
 * Call after saving a rep. Updates streak, XP, and level on the user doc.
 * Returns { newXp, newLevel, newStreak, leveledUp, xpEarned }
 */
export async function processRepCompletion(userId, xpEarned) {
  const profile = await getUserProfile(userId)
  const today = new Date().toDateString()
  const lastRep = profile.lastRepDate
    ? new Date(profile.lastRepDate.seconds * 1000).toDateString()
    : null

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toDateString()

  // Already done today — no double XP
  if (lastRep === today) {
    return {
      newXp: profile.xp,
      newLevel: profile.level,
      newStreak: profile.streakCount,
      leveledUp: false,
      xpEarned: 0,
      alreadyDoneToday: true,
    }
  }

  // Calculate new streak
  let newStreak
  if (lastRep === yesterdayStr) {
    newStreak = profile.streakCount + 1
  } else if (lastRep === today) {
    newStreak = profile.streakCount
  } else {
    // Missed a day — use streak freeze if available
    if (profile.streakFreezesAvailable > 0 && profile.streakCount > 0) {
      newStreak = profile.streakCount // freeze saves it
    } else {
      newStreak = 1 // reset
    }
  }

  const newXp = profile.xp + xpEarned
  const newLevel = calculateLevel(newXp)
  const leveledUp = newLevel > profile.level

  const updateData = {
    xp: increment(xpEarned),
    level: newLevel,
    streakCount: newStreak,
    lastRepDate: serverTimestamp(),
  }

  // Consume streak freeze if it was used
  if (
    lastRep !== yesterdayStr &&
    lastRep !== today &&
    profile.streakFreezesAvailable > 0 &&
    profile.streakCount > 0
  ) {
    updateData.streakFreezesAvailable = profile.streakFreezesAvailable - 1
  }

  await updateDoc(doc(db, 'users', userId), updateData)

  return { newXp, newLevel, newStreak, leveledUp, xpEarned }
}

// ─── XP / Level helpers ──────────────────────────────────────────────────────

export const LEVELS = [
  { level: 1, name: 'First Words', minXp: 0 },
  { level: 2, name: 'Finding My Voice', minXp: 100 },
  { level: 3, name: 'Rising Voice', minXp: 300 },
  { level: 4, name: 'Gaining Confidence', minXp: 600 },
  { level: 5, name: 'Confident Speaker', minXp: 1000 },
  { level: 6, name: 'Clear & Compelling', minXp: 1500 },
  { level: 7, name: 'Podium Ready', minXp: 2200 },
  { level: 8, name: 'Master Orator', minXp: 3000 },
]

export function calculateLevel(xp) {
  let level = 1
  for (const tier of LEVELS) {
    if (xp >= tier.minXp) level = tier.level
  }
  return level
}

export function getLevelName(level) {
  return LEVELS.find((l) => l.level === level)?.name ?? 'Rising Voice'
}

export function getXpToNextLevel(currentXp, currentLevel) {
  const next = LEVELS.find((l) => l.level === currentLevel + 1)
  if (!next) return null
  return next.minXp - currentXp
}

export function getLevelProgress(currentXp, currentLevel) {
  const current = LEVELS.find((l) => l.level === currentLevel)
  const next = LEVELS.find((l) => l.level === currentLevel + 1)
  if (!next) return 100
  const range = next.minXp - current.minXp
  const progress = currentXp - current.minXp
  return Math.min(100, Math.round((progress / range) * 100))
}
