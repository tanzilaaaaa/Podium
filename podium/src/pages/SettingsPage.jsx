import { useNavigate } from 'react-router-dom'
import { ChevronLeft, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { getLevelName } from '../lib/firestore'

export default function SettingsPage() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/auth')
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#6B7280]" />
          </button>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Settings</h1>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B6B]/10 flex items-center justify-center">
              <User className="w-6 h-6 text-[#FF6B6B]" />
            </div>
            <div>
              <p className="font-semibold text-[#1A1A1A]">{profile?.displayName || user?.displayName || 'Speaker'}</p>
              <p className="text-sm text-[#6B7280]">{user?.email}</p>
              <p className="text-xs text-[#FF6B6B] font-medium mt-0.5">
                {getLevelName(profile?.level || 1)} · {profile?.xp || 0} XP
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Your stats</p>
          <div className="space-y-3">
            <Row label="Current streak" value={`${profile?.streakCount || 0} days`} />
            <Row label="Streak freezes" value={`${profile?.streakFreezesAvailable ?? 1} remaining`} />
            <Row label="Level" value={`${profile?.level || 1} — ${getLevelName(profile?.level || 1)}`} />
            <Row label="Total XP" value={profile?.xp || 0} />
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">About Podium</p>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            Podium is a daily speaking practice app. v1 scoring uses heuristic algorithms (pace, filler words, clarity proxy) — not true NLP. It's a starting point for building the habit, not a clinical assessment.
          </p>
          <p className="text-sm text-[#6B7280] leading-relaxed mt-2">
            Your voice recordings are processed locally in your browser and are not stored on our servers.
          </p>
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 text-[#6B7280] text-sm font-medium hover:bg-gray-50 hover:text-[#1A1A1A] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#6B7280]">{label}</span>
      <span className="text-sm font-medium text-[#1A1A1A]">{value}</span>
    </div>
  )
}
