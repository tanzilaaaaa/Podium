import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNav from './components/BottomNav'
import { OfflineBanner } from './components/EdgeCaseScreens'

import LandingPage    from './pages/LandingPage'
import AuthPage       from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import HomePage       from './pages/HomePage'
import RecordPage     from './pages/RecordPage'
import ResultsPage    from './pages/ResultsPage'
import ProgressPage   from './pages/ProgressPage'
import BadgesPage     from './pages/BadgesPage'
import ProfilePage    from './pages/ProfilePage'
import PromptsPage    from './pages/PromptsPage'
import HistoryPage    from './pages/HistoryPage'
import SeedPage       from './pages/SeedPage'

// Root redirects authenticated users straight to /home
function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d0d1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #6644ee', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
  if (user) return <Navigate to="/home" replace />
  return <LandingPage />
}

const NAV_HIDDEN = ['/', '/auth', '/onboarding', '/record', '/results', '/seed']

export default function App() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const up   = () => setOffline(false)
    const down = () => setOffline(true)
    window.addEventListener('online',  up)
    window.addEventListener('offline', down)
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down) }
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatePresence>
          {offline && <OfflineBanner key="offline" />}
        </AnimatePresence>

        <Routes>
          {/* Root — auto-routes based on auth state */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/seed" element={<SeedPage />} />

          {/* Onboarding — once after signup */}
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

          {/* Main app */}
          <Route path="/home"     element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/record"   element={<ProtectedRoute><RecordPage /></ProtectedRoute>} />
          <Route path="/results"  element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
          <Route path="/badges"   element={<ProtectedRoute><BadgesPage /></ProtectedRoute>} />
          <Route path="/profile"  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/prompts"  element={<ProtectedRoute><PromptsPage /></ProtectedRoute>} />
          <Route path="/history"  element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Routes>
          {NAV_HIDDEN.map(p => <Route key={p} path={p} element={null} />)}
          <Route path="*" element={<BottomNav />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
