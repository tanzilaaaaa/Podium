import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNav from './components/BottomNav'
import { OfflineBanner } from './components/EdgeCaseScreens'

import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import HomePage from './pages/HomePage'
import RecordPage from './pages/RecordPage'
import ResultsPage from './pages/ResultsPage'
import HistoryPage from './pages/HistoryPage'
import PromptsPage from './pages/PromptsPage'
import ProgressPage from './pages/ProgressPage'
import BadgesPage from './pages/BadgesPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import PaywallPage from './pages/PaywallPage'
import SeedPage from './pages/SeedPage'

export default function App() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOnline = () => setOffline(false)
    const goOffline = () => setOffline(true)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatePresence>
          {offline && <OfflineBanner key="offline" />}
        </AnimatePresence>

        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/paywall" element={<PaywallPage />} />

          {/* Onboarding — protected so we have user context */}
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

          {/* Main app */}
          <Route path="/home"       element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/record"     element={<ProtectedRoute><RecordPage /></ProtectedRoute>} />
          <Route path="/results"    element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
          <Route path="/progress"   element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
          <Route path="/badges"     element={<ProtectedRoute><BadgesPage /></ProtectedRoute>} />
          <Route path="/profile"    element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Legacy / util */}
          <Route path="/history"    element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/prompts"    element={<ProtectedRoute><PromptsPage /></ProtectedRoute>} />
          <Route path="/settings"   element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/seed"       element={<SeedPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Bottom nav — only on main app pages */}
        <Routes>
          <Route path="/" element={null} />
          <Route path="/auth" element={null} />
          <Route path="/onboarding" element={null} />
          <Route path="/record" element={null} />
          <Route path="/results" element={null} />
          <Route path="/paywall" element={null} />
          <Route path="/seed" element={null} />
          <Route path="*" element={<BottomNav />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
