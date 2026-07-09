import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth()
  const { pathname } = useLocation()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0d0d1a',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          border: '2px solid #6644ee', borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />

  // Only redirect to onboarding if profile is loaded AND onboardingDone is explicitly false
  // Avoids redirect loops while profile is still loading (null/undefined)
  if (profile && profile.onboardingDone === false && pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return children
}
