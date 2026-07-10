import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { syncUser, getMe, updateMe } from '../lib/api'

const AuthContext = createContext(null)
export { AuthContext }

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch profile from Go backend and update state
  async function loadProfile(firebaseUser) {
    try {
      const p = await syncUser(firebaseUser.displayName || '')
      setProfile(p)
      return p
    } catch (err) {
      console.warn('Backend sync failed — retrying getMe:', err.message)
      // syncUser might fail if backend is temporarily down; try a plain GET
      try {
        const p = await getMe()
        setProfile(p)
        return p
      } catch {
        // Backend unreachable — app still works, profile just stays null
        console.error('Could not load profile from backend')
        return null
      }
    }
  }

  useEffect(() => {
    // Handle Google redirect result on page load
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        await loadProfile(result.user)
      }
    }).catch(console.error)

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        await loadProfile(firebaseUser)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      // loadProfile called by onAuthStateChanged listener above
      return result
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, googleProvider)
        return
      }
      throw err
    }
  }

  async function signInWithEmail(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password)
    // onAuthStateChanged will call loadProfile automatically
    return result
  }

  async function signUpWithEmail(email, password, displayName) {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName })
    // Sync to Postgres — creates the user row
    const p = await syncUser(displayName)
    setProfile(p)
    return result
  }

  async function logout() {
    await signOut(auth)
    setProfile(null)
  }

  async function refreshProfile() {
    if (!auth.currentUser) return
    try {
      const p = await getMe()
      setProfile(p)
    } catch (err) {
      console.error('refreshProfile error:', err)
    }
  }

  // updateMe wrapper — patches profile via Go API and refreshes state
  async function updateProfile_(fields) {
    const p = await updateMe(fields)
    setProfile(p)
    return p
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      logout,
      refreshProfile,
      updateProfile: updateProfile_,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
