import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useTheme, tokens } from '../context/ThemeContext'
import { getBadges } from '../lib/api'

// Static badge definitions — locked/unlocked driven by earned list from Firestore
const ALL_BADGES = [
  // Streak milestones
  { id: 'streak_3',   emoji: '🔥', name: 'On Fire',        desc: '3-day streak',          category: 'Streaks' },
  { id: 'streak_7',   emoji: '🗓️', name: 'Week Warrior',   desc: '7-day streak',          category: 'Streaks' },
  { id: 'streak_14',  emoji: '💪', name: 'Two Weeks In',   desc: '14-day streak',         category: 'Streaks' },
  { id: 'streak_30',  emoji: '🏆', name: 'Monthly Master', desc: '30-day streak',         category: 'Streaks' },
  // Reps milestones
  { id: 'reps_1',     emoji: '🎤', name: 'First Words',    desc: 'Complete your first rep',     category: 'Reps' },
  { id: 'reps_10',    emoji: '🎯', name: 'Ten Reps',       desc: 'Complete 10 reps',            category: 'Reps' },
  { id: 'reps_25',    emoji: '🚀', name: 'Rising Voice',   desc: 'Complete 25 reps',            category: 'Reps' },
  { id: 'reps_50',    emoji: '⭐', name: 'Podium Regular', desc: 'Complete 50 reps',            category: 'Reps' },
  // Score milestones
  { id: 'score_80',   emoji: '✨', name: 'Sharp',          desc: 'Score 80+ on a rep',          category: 'Performance' },
  { id: 'score_90',   emoji: '💎', name: 'Diamond',        desc: 'Score 90+ on a rep',          category: 'Performance' },
  { id: 'no_fillers', emoji: '🤫', name: 'Crisp',          desc: 'Zero filler words in a rep',  category: 'Performance' },
  { id: 'pace_ace',   emoji: '🎵', name: 'Pace Ace',       desc: 'Perfect pace score',          category: 'Performance' },
  // XP milestones
  { id: 'xp_100',     emoji: '⚡', name: 'Sparked',        desc: 'Earn 100 XP',                 category: 'XP' },
  { id: 'xp_500',     emoji: '🌟', name: 'Glowing',        desc: 'Earn 500 XP',                 category: 'XP' },
  { id: 'xp_1000',    emoji: '🔮', name: 'Leveled Up',     desc: 'Earn 1,000 XP',               category: 'XP' },
  { id: 'xp_3000',    emoji: '👑', name: 'Orator',         desc: 'Earn 3,000 XP',               category: 'XP' },
]

const CATEGORIES = ['All', 'Streaks', 'Reps', 'Performance', 'XP']

export default function BadgesPage() {
  const { user, profile } = useAuth()
  const [earned, setEarned] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const { theme } = useTheme()
  const t = tokens(theme)

  useEffect(() => {
    if (!user) return
    getBadges()
      .then(res => {
        const earnedIds = (res.badges || [])
          .filter(b => b.earnedAt)
          .map(b => b.id)
        setEarned(new Set(earnedIds))
      })
      .finally(() => setLoading(false))
  }, [user])

  // Also check profile data for automatic badge eligibility
  const earnedWithProfile = new Set(earned)
  if (profile) {
    if ((profile.streakCount || 0) >= 3)  earnedWithProfile.add('streak_3')
    if ((profile.streakCount || 0) >= 7)  earnedWithProfile.add('streak_7')
    if ((profile.streakCount || 0) >= 14) earnedWithProfile.add('streak_14')
    if ((profile.streakCount || 0) >= 30) earnedWithProfile.add('streak_30')
    if ((profile.xp || 0) >= 100)  earnedWithProfile.add('xp_100')
    if ((profile.xp || 0) >= 500)  earnedWithProfile.add('xp_500')
    if ((profile.xp || 0) >= 1000) earnedWithProfile.add('xp_1000')
    if ((profile.xp || 0) >= 3000) earnedWithProfile.add('xp_3000')
  }

  const filtered = activeCategory === 'All'
    ? ALL_BADGES
    : ALL_BADGES.filter(b => b.category === activeCategory)

  const earnedCount = ALL_BADGES.filter(b => earnedWithProfile.has(b.id)).length

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 0' }}>
        <h1 style={{ color: t.text, fontSize: 22, fontWeight: 700, margin: '0 0 3px' }}>Badges</h1>
        <p style={{ color: t.textSec, fontSize: 13, margin: 0 }}>
          {earnedCount} / {ALL_BADGES.length} unlocked
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ height: 5, background: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(earnedCount / ALL_BADGES.length) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #4422cc, #a78bfa)', borderRadius: 3 }}
          />
        </div>
      </div>

      {/* Category filter */}
      <div style={{ padding: '14px 20px 0', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={{
              padding: '6px 14px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0,
              border: `1px solid ${activeCategory === cat ? t.accent : t.border}`,
              background: activeCategory === cat ? t.accentBg : 'transparent',
              color: activeCategory === cat ? t.accentLight : t.textSec,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {filtered.map((badge, i) => {
          const unlocked = earnedWithProfile.has(badge.id)
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{
                background: unlocked ? t.accentBg : t.bgCard,
                border: `1px solid ${unlocked ? t.accentBorder : t.border}`,
                borderRadius: 14, padding: '16px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center', gap: 8, position: 'relative',
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: unlocked ? t.accentBg : theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: unlocked ? 24 : 0,
              }}>
                {unlocked
                  ? badge.emoji
                  : <Lock size={18} color={t.textTer} />
                }
              </div>

              <div>
                <p style={{ color: unlocked ? t.text : t.textTer, fontWeight: 600, fontSize: 13, margin: '0 0 2px' }}>
                  {badge.name}
                </p>
                <p style={{ color: unlocked ? t.textSec : t.textTer, fontSize: 11, margin: 0, lineHeight: 1.4 }}>
                  {badge.desc}
                </p>
              </div>

              {unlocked && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 16, height: 16, borderRadius: '50%',
                  background: t.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: 'white', fontSize: 9, fontWeight: 800 }}>✓</span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
