import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Flame, Zap, ChevronRight, Mic,
  TrendingUp, TrendingDown, Minus,
  CheckCircle2, Sun, Moon,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useTheme, tokens } from '../context/ThemeContext'
import { getLevelName, getLevelProgress, getXpToNextLevel } from '../lib/firestore'
import { getReps } from '../lib/api'
import { PROMPTS } from '../lib/seedData'

const CATEGORY_COLORS = {
  persuasion:   { bg: 'rgba(168,85,247,0.15)',  text: '#c084fc', border: 'rgba(168,85,247,0.3)' },
  storytelling: { bg: 'rgba(59,130,246,0.15)',  text: '#93c5fd', border: 'rgba(59,130,246,0.3)' },
  impromptu:    { bg: 'rgba(34,197,94,0.15)',   text: '#4ade80', border: 'rgba(34,197,94,0.3)'  },
  interview:    { bg: 'rgba(251,146,60,0.15)',  text: '#fb923c', border: 'rgba(251,146,60,0.3)' },
}

function TrendIcon({ val }) {
  if (val > 0) return <TrendingUp size={13} color="#22c55e" />
  if (val < 0) return <TrendingDown size={13} color="#f87171" />
  return <Minus size={13} color="currentColor" style={{ opacity: 0.3 }} />
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export default function HomePage() {
  const { profile, user } = useAuth()
  const { theme, toggle } = useTheme()
  const t = tokens(theme)
  const navigate = useNavigate()
  const [reps, setReps] = useState([])
  const [todayPrompt, setTodayPrompt] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
    setTodayPrompt(PROMPTS[dayOfYear % PROMPTS.length])
    if (user) {
      getReps(10).then(r => { setReps(r.reps || []); setLoading(false) })
    } else { setLoading(false) }
  }, [user])

  const latestRep = reps[0] || null
  const prevRep = reps[1] || null
  const fillerTrend = latestRep && prevRep ? prevRep.fillerCount - latestRep.fillerCount : 0
  const paceTrend = latestRep && prevRep ? latestRep.wpm - prevRep.wpm : 0
  const clarityTrend = latestRep && prevRep ? latestRep.clarityScore - prevRep.clarityScore : 0
  const todayDone = latestRep && new Date(latestRep.createdAt?.seconds * 1000).toDateString() === new Date().toDateString()

  if (!profile && loading) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${t.accent}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const levelName = getLevelName(profile?.level || 1)
  const xpProgress = getLevelProgress(profile?.xp || 0, profile?.level || 1)
  const xpToNext = getXpToNextLevel(profile?.xp || 0, profile?.level || 1)
  const catStyle = CATEGORY_COLORS[todayPrompt?.category] || CATEGORY_COLORS.impromptu

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Streak */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: theme === 'dark' ? 'rgba(255,107,107,0.12)' : 'rgba(255,107,107,0.1)',
            border: '1px solid rgba(255,107,107,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Flame size={16} color="#ef4444" />
          </div>
          <div>
            <span style={{ color: t.text, fontWeight: 800, fontSize: 18 }}>{profile?.streakCount || 0}</span>
            <span style={{ color: t.textSec, fontSize: 12, marginLeft: 4 }}>day streak</span>
          </div>
        </div>

        {/* Right side — theme toggle + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={toggle} style={{
            width: 34, height: 34, borderRadius: 9,
            background: t.bgCard, border: `1px solid ${t.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            {theme === 'dark'
              ? <Sun size={15} color={t.textSec} />
              : <Moon size={15} color={t.textSec} />
            }
          </button>

          <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4422cc, #6644ee)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 13,
            }}>
              {(profile?.displayName || 'U')[0].toUpperCase()}
            </div>
          </button>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* Greeting */}
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <p style={{ color: t.textSec, fontSize: 13, margin: 0 }}>Good {getTimeOfDay()}</p>
          <h1 style={{ color: t.text, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: '3px 0 0' }}>
            {profile?.displayName?.split(' ')[0] || 'Speaker'}
          </h1>
        </div>

        {/* XP card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <p style={{ color: t.textTer, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Level {profile?.level || 1}</p>
              <p style={{ color: t.text, fontSize: 14, fontWeight: 600, margin: '2px 0 0' }}>{levelName}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Zap size={13} color="#f59e0b" />
              <span style={{ color: t.text, fontWeight: 700, fontSize: 14 }}>{profile?.xp || 0}</span>
              {xpToNext && <span style={{ color: t.textTer, fontSize: 12 }}>/ {(profile?.xp || 0) + xpToNext}</span>}
            </div>
          </div>
          <div style={{ height: 4, background: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #4422cc, #a78bfa)', borderRadius: 2 }}
            />
          </div>
        </motion.div>

        {/* Today's prompt */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ marginBottom: 12 }}
        >
          {todayDone ? (
            <div style={{
              background: theme === 'dark' ? 'rgba(34,197,94,0.07)' : 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 14, padding: '18px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <CheckCircle2 size={18} color="#22c55e" />
                <span style={{ color: '#22c55e', fontWeight: 600, fontSize: 14 }}>Done for today</span>
              </div>
              <p style={{ color: t.textSec, fontSize: 13, margin: '0 0 14px', lineHeight: 1.5 }}>
                Solid work. Want to do a bonus rep?
              </p>
              <button onClick={() => navigate('/record', { state: { prompt: todayPrompt, bonus: true } })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 9,
                  border: '1px solid rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.08)',
                  color: '#22c55e', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}>
                <Mic size={14} /> Bonus rep
              </button>
            </div>
          ) : (
            <div style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(68,34,204,0.5), rgba(102,68,238,0.3))'
                : 'linear-gradient(135deg, rgba(68,34,204,0.08), rgba(102,68,238,0.05))',
              border: `1px solid ${t.accentBorder}`,
              borderRadius: 14, padding: '18px',
            }}>
              <div style={{ display: 'flex', gap: 7, marginBottom: 10 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20,
                  background: catStyle.bg, color: catStyle.text, border: `1px solid ${catStyle.border}`,
                  textTransform: 'capitalize',
                }}>
                  {todayPrompt?.category}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20,
                  background: t.bgCard, color: t.textSec,
                  border: `1px solid ${t.border}`,
                }}>
                  60s
                </span>
              </div>
              <p style={{ color: t.text, fontSize: 15, fontWeight: 500, lineHeight: 1.55, margin: '0 0 18px' }}>
                {todayPrompt?.text}
              </p>
              <button onClick={() => navigate('/record', { state: { prompt: todayPrompt } })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '13px 20px', borderRadius: 11, border: 'none',
                  background: t.accent, color: 'white', fontWeight: 600, fontSize: 14,
                  cursor: 'pointer', justifyContent: 'center',
                }}>
                <Mic size={16} /> Start speaking
              </button>
            </div>
          )}
        </motion.div>

        {/* Last rep */}
        {latestRep ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <p style={{ color: t.textSec, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Last rep</p>
              <button onClick={() => navigate('/progress')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.accentLight, fontSize: 12, display: 'flex', alignItems: 'center', gap: 3 }}>
                See all <ChevronRight size={12} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
              {[
                { label: 'Clarity',  val: latestRep.clarityScore, unit: '/100', trend: clarityTrend },
                { label: 'Fillers',  val: latestRep.fillerCount,  unit: 'words', trend: -fillerTrend },
                { label: 'Pace',     val: latestRep.wpm,          unit: 'wpm',  trend: 0 },
              ].map(({ label, val, unit, trend }) => (
                <div key={label} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 11, padding: '11px' }}>
                  <p style={{ color: t.textTer, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>{label}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                    <span style={{ color: t.text, fontWeight: 700, fontSize: 18 }}>{val}</span>
                    <span style={{ color: t.textTer, fontSize: 10 }}>{unit}</span>
                  </div>
                  <div style={{ marginTop: 3, color: t.textTer }}><TrendIcon val={trend} /></div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: '16px', marginBottom: 12, textAlign: 'center' }}>
            <p style={{ color: t.textSec, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              Complete your first rep to start tracking progress.
            </p>
          </motion.div>
        )}

        {/* Browse prompts */}
        <button onClick={() => navigate('/prompts')}
          style={{
            width: '100%', padding: '12px', borderRadius: 11,
            border: `1px solid ${t.border}`, background: t.bgCard,
            color: t.textSec, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          }}>
          Browse all prompts <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}
