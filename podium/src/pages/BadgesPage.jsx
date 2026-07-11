import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, X } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useTheme, tokens } from '../context/ThemeContext'
import { getBadges } from '../lib/api'

const ALL_BADGES = [
  { id: 'streak_3',   emoji: '🔥', name: 'On Fire',        desc: '3-day streak',               category: 'Streaks' },
  { id: 'streak_7',   emoji: '🗓️', name: 'Week Warrior',   desc: '7-day streak',               category: 'Streaks' },
  { id: 'streak_14',  emoji: '💪', name: 'Two Weeks In',   desc: '14-day streak',              category: 'Streaks' },
  { id: 'streak_30',  emoji: '🏆', name: 'Monthly Master', desc: '30-day streak',              category: 'Streaks' },
  { id: 'reps_1',     emoji: '🎤', name: 'First Words',    desc: 'Complete your first rep',    category: 'Reps' },
  { id: 'reps_10',    emoji: '🎯', name: 'Ten Reps',       desc: 'Complete 10 reps',           category: 'Reps' },
  { id: 'reps_25',    emoji: '🚀', name: 'Rising Voice',   desc: 'Complete 25 reps',           category: 'Reps' },
  { id: 'reps_50',    emoji: '⭐', name: 'Podium Regular', desc: 'Complete 50 reps',           category: 'Reps' },
  { id: 'score_80',   emoji: '✨', name: 'Sharp',          desc: 'Score 80+ on a rep',         category: 'Performance' },
  { id: 'score_90',   emoji: '💎', name: 'Diamond',        desc: 'Score 90+ on a rep',         category: 'Performance' },
  { id: 'no_fillers', emoji: '🤫', name: 'Crisp',          desc: 'Zero filler words in a rep', category: 'Performance' },
  { id: 'pace_ace',   emoji: '🎵', name: 'Pace Ace',       desc: 'Perfect pace score',         category: 'Performance' },
  { id: 'xp_100',     emoji: '⚡', name: 'Sparked',        desc: 'Earn 100 XP',                category: 'XP' },
  { id: 'xp_500',     emoji: '🌟', name: 'Glowing',        desc: 'Earn 500 XP',                category: 'XP' },
  { id: 'xp_1000',    emoji: '🔮', name: 'Leveled Up',     desc: 'Earn 1,000 XP',              category: 'XP' },
  { id: 'xp_3000',    emoji: '👑', name: 'Orator',         desc: 'Earn 3,000 XP',              category: 'XP' },
]

const CATEGORIES = ['All', 'Streaks', 'Reps', 'Performance', 'XP']

export default function BadgesPage() {
  const { user, profile } = useAuth()
  const { theme } = useTheme()
  const t = tokens(theme)

  const [earnedMap, setEarnedMap] = useState({})   // id → earnedAt string
  const [loading, setLoading]     = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedBadge, setSelectedBadge]   = useState(null)

  useEffect(() => {
    if (!user) return
    getBadges()
      .then(res => {
        const map = {}
        ;(res.badges || []).filter(b => b.earnedAt).forEach(b => { map[b.id] = b.earnedAt })
        setEarnedMap(map)
      })
      .finally(() => setLoading(false))
  }, [user])

  // Merge server-earned with profile-derived eligibility
  const earnedWithProfile = { ...earnedMap }
  if (profile) {
    const now = new Date().toISOString()
    if ((profile.streakCount || 0) >= 3  && !earnedWithProfile.streak_3)  earnedWithProfile.streak_3  = now
    if ((profile.streakCount || 0) >= 7  && !earnedWithProfile.streak_7)  earnedWithProfile.streak_7  = now
    if ((profile.streakCount || 0) >= 14 && !earnedWithProfile.streak_14) earnedWithProfile.streak_14 = now
    if ((profile.streakCount || 0) >= 30 && !earnedWithProfile.streak_30) earnedWithProfile.streak_30 = now
    if ((profile.xp || 0) >= 100  && !earnedWithProfile.xp_100)  earnedWithProfile.xp_100  = now
    if ((profile.xp || 0) >= 500  && !earnedWithProfile.xp_500)  earnedWithProfile.xp_500  = now
    if ((profile.xp || 0) >= 1000 && !earnedWithProfile.xp_1000) earnedWithProfile.xp_1000 = now
    if ((profile.xp || 0) >= 3000 && !earnedWithProfile.xp_3000) earnedWithProfile.xp_3000 = now
  }

  const filtered = activeCategory === 'All'
    ? ALL_BADGES
    : ALL_BADGES.filter(b => b.category === activeCategory)

  const earnedCount = ALL_BADGES.filter(b => earnedWithProfile[b.id]).length

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 0' }}>
        <h1 style={{ color: t.text, fontSize: 22, fontWeight: 700, margin: '0 0 3px' }}>Badges</h1>
        <p style={{ color: t.textSec, fontSize: 13, margin: 0 }}>{earnedCount} / {ALL_BADGES.length} unlocked</p>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{ height: 5, background: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${(earnedCount / ALL_BADGES.length) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #4422cc, #a78bfa)', borderRadius: 3 }}
          />
        </div>
      </div>

      {/* Category filter */}
      <div style={{ padding: '12px 20px 0', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
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
      <div style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {filtered.map((badge, i) => {
          const earnedAt = earnedWithProfile[badge.id]
          const unlocked = !!earnedAt
          const earnedDate = earnedAt && earnedAt !== new Date().toISOString()
            ? new Date(earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : null

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedBadge({ ...badge, unlocked, earnedDate })}
              style={{
                background: unlocked ? t.accentBg : t.bgCard,
                border: `1px solid ${unlocked ? t.accentBorder : t.border}`,
                borderRadius: 14, padding: '16px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center', gap: 6, position: 'relative',
                cursor: 'pointer', transition: 'border-color 0.15s',
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: unlocked ? t.accentBg : theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: unlocked ? 24 : 0,
              }}>
                {unlocked ? badge.emoji : <Lock size={18} color={t.textTer} />}
              </div>

              <div>
                <p style={{ color: unlocked ? t.text : t.textTer, fontWeight: 600, fontSize: 13, margin: '0 0 2px' }}>{badge.name}</p>
                <p style={{ color: unlocked ? t.textSec : t.textTer, fontSize: 11, margin: 0, lineHeight: 1.4 }}>{badge.desc}</p>
                {unlocked && earnedDate && (
                  <p style={{ color: t.accentLight, fontSize: 10, margin: '4px 0 0', fontWeight: 500 }}>{earnedDate}</p>
                )}
              </div>

              {unlocked && (
                <div style={{ position: 'absolute', top: 10, right: 10, width: 16, height: 16, borderRadius: '50%', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontSize: 9, fontWeight: 800 }}>✓</span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Badge detail modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedBadge(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 340 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 480, background: '#141428', borderRadius: '24px 24px 0 0', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '24px 24px 40px', fontFamily: 'Inter, system-ui, sans-serif', textAlign: 'center' }}
            >
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 20px' }} />

              {/* Close */}
              <button onClick={() => setSelectedBadge(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                <X size={18} />
              </button>

              {/* Badge icon */}
              <div style={{
                width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
                background: selectedBadge.unlocked ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: selectedBadge.unlocked ? 36 : 0,
                boxShadow: selectedBadge.unlocked ? '0 0 32px rgba(167,139,250,0.3)' : 'none',
              }}>
                {selectedBadge.unlocked ? selectedBadge.emoji : <Lock size={28} color="rgba(255,255,255,0.2)" />}
              </div>

              <p style={{ color: selectedBadge.unlocked ? '#a78bfa' : 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>
                {selectedBadge.unlocked ? 'Unlocked' : 'Locked'}
              </p>
              <h3 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>{selectedBadge.name}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>{selectedBadge.desc}</p>

              {selectedBadge.unlocked && selectedBadge.earnedDate && (
                <div style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 10, padding: '10px 16px', display: 'inline-block' }}>
                  <span style={{ color: '#a78bfa', fontSize: 13, fontWeight: 600 }}>Earned {selectedBadge.earnedDate}</span>
                </div>
              )}

              {!selectedBadge.unlocked && (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 16px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>Complete the criteria to unlock this badge</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
