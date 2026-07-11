import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, Bell, ChevronRight, Check,
  Briefcase, Brain, CalendarClock, MessageCircle,
  BarChart2, Flame, Award,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'

const GOALS = [
  { id: 'interview',  icon: Briefcase,      title: 'Interview prep',          desc: 'Nail your next job interview' },
  { id: 'anxiety',    icon: Brain,          title: 'Public speaking anxiety', desc: 'Build confidence step by step' },
  { id: 'event',      icon: CalendarClock,  title: 'Upcoming event',          desc: 'Wedding toast, conference talk, pitch' },
  { id: 'confidence', icon: MessageCircle,  title: 'General confidence',      desc: 'Become a better communicator' },
]

const STEPS = 3 // welcome, goals, permissions

const variants = {
  enter:  { opacity: 0, x: 32 },
  center: { opacity: 1, x: 0  },
  exit:   { opacity: 0, x: -32 },
}

export default function OnboardingPage() {
  const { user, refreshProfile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)          // 0=welcome, 1=goals, 2=permissions
  const [selectedGoals, setSelectedGoals] = useState([])
  const [micGranted, setMicGranted] = useState(false)
  const [micLoading, setMicLoading] = useState(false)
  const [micError, setMicError] = useState(false)

  function toggleGoal(id) {
    setSelectedGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  async function handleGoalsContinue() {
    if (!selectedGoals.length) return
    if (user) await updateProfile({ goals: selectedGoals }).catch(() => {})
    setStep(2)
  }

  async function requestMic() {
    setMicLoading(true); setMicError(false)
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true })
      s.getTracks().forEach(t => t.stop())
      setMicGranted(true)
    } catch { setMicError(true) }
    finally { setMicLoading(false) }
  }

  async function finish() {
    if (user) {
      await updateProfile({ onboardingDone: true }).catch(() => {})
      await refreshProfile()
    }
    navigate('/home')
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      background: '#0d0d1a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '24px 20px',
    }}>
      {/* Step dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
        {Array.from({ length: STEPS }).map((_, i) => (
          <div key={i} style={{
            width: i === step ? 20 : 6, height: 6, borderRadius: 3,
            background: i <= step ? '#6644ee' : 'rgba(255,255,255,0.12)',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <motion.div
            key="welcome"
            variants={variants} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.25 }}
            style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}
          >
            {/* Icon cluster */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 32 }}>
              {[
                { Icon: Mic,       bg: 'rgba(102,68,238,0.2)', color: '#a78bfa' },
                { Icon: BarChart2, bg: 'rgba(59,130,246,0.2)', color: '#93c5fd' },
                { Icon: Award,     bg: 'rgba(251,191,36,0.2)', color: '#fbbf24' },
              ].map(({ Icon, bg, color }, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1, type: 'spring', damping: 14 }}
                  style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: bg, border: `1px solid ${color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon size={24} color={color} />
                </motion.div>
              ))}
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ color: 'white', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 12px' }}
            >
              Get better at speaking,<br />one minute a day.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
              style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.6, margin: '0 0 32px' }}
            >
              Daily 60-second reps. Instant feedback on pace, filler words, and clarity. Build the habit. Watch the numbers move.
            </motion.p>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 36 }}
            >
              {['Daily prompts', 'Instant scoring', 'Streak tracking', 'XP & levels'].map(f => (
                <span key={f} style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.6)',
                }}>{f}</span>
              ))}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              onClick={() => setStep(1)}
              style={{
                width: '100%', padding: '15px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #4422cc, #6644ee)',
                color: 'white', fontWeight: 600, fontSize: 15,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 8px 32px rgba(68,34,204,0.4)',
              }}
            >
              Get started <ChevronRight size={17} />
            </motion.button>
          </motion.div>
        )}

        {/* ── Step 1: Goals ── */}
        {step === 1 && (
          <motion.div
            key="goals"
            variants={variants} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.25 }}
            style={{ width: '100%', maxWidth: 480 }}
          >
            <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px', textAlign: 'center' }}>
              What are you working on?
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, textAlign: 'center', margin: '0 0 24px', lineHeight: 1.5 }}>
              We'll tailor your daily prompts to your goal.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {GOALS.map(g => {
                const sel = selectedGoals.includes(g.id)
                const Icon = g.icon
                return (
                  <button key={g.id} onClick={() => toggleGoal(g.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', borderRadius: 12,
                      background: sel ? 'rgba(102,68,238,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1.5px solid ${sel ? '#6644ee' : 'rgba(255,255,255,0.08)'}`,
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
                    }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: sel ? 'rgba(102,68,238,0.2)' : 'rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={18} color={sel ? '#a78bfa' : 'rgba(255,255,255,0.4)'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: 'white', fontWeight: 600, fontSize: 14, margin: 0 }}>{g.title}</p>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '2px 0 0' }}>{g.desc}</p>
                    </div>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: sel ? '#6644ee' : 'rgba(255,255,255,0.06)',
                      border: `1.5px solid ${sel ? '#6644ee' : 'rgba(255,255,255,0.12)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.18s',
                    }}>
                      {sel && <Check size={11} color="white" strokeWidth={3} />}
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={handleGoalsContinue}
              disabled={!selectedGoals.length}
              style={{
                width: '100%', padding: '14px', borderRadius: 11, border: 'none',
                background: selectedGoals.length ? 'linear-gradient(135deg, #4422cc, #6644ee)' : 'rgba(255,255,255,0.08)',
                color: selectedGoals.length ? 'white' : 'rgba(255,255,255,0.25)',
                fontWeight: 600, fontSize: 14, cursor: selectedGoals.length ? 'pointer' : 'not-allowed',
                marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                transition: 'all 0.2s',
              }}
            >
              Continue <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {/* ── Step 2: Permissions ── */}
        {step === 2 && (
          <motion.div
            key="perms"
            variants={variants} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.25 }}
            style={{ width: '100%', maxWidth: 480 }}
          >
            <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px', textAlign: 'center' }}>
              Two quick things
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, textAlign: 'center', margin: '0 0 24px' }}>
              Podium needs these to work.
            </p>

            {/* Mic card */}
            <div style={{
              padding: '18px', borderRadius: 12, marginBottom: 10,
              background: micGranted ? 'rgba(34,197,94,0.07)' : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${micGranted ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: micGranted ? 'rgba(34,197,94,0.12)' : 'rgba(102,68,238,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Mic size={18} color={micGranted ? '#22c55e' : '#a78bfa'} />
                </div>
                <div>
                  <p style={{ color: 'white', fontWeight: 600, fontSize: 14, margin: 0 }}>Microphone</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '3px 0 0', lineHeight: 1.5 }}>
                    We'll ask for mic access next — it's only used to score your practice reps. Recordings stay private.
                  </p>
                </div>
              </div>
              {micGranted ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e', fontSize: 13, fontWeight: 600 }}>
                  <Check size={14} strokeWidth={2.5} /> Access granted
                </div>
              ) : (
                <button onClick={requestMic} disabled={micLoading}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: 'rgba(102,68,238,0.18)', color: '#a78bfa', fontWeight: 600, fontSize: 13, cursor: micLoading ? 'wait' : 'pointer' }}>
                  {micLoading ? 'Requesting…' : 'Allow microphone'}
                </button>
              )}
              {micError && (
                <p style={{ color: '#f87171', fontSize: 12, margin: '8px 0 0', lineHeight: 1.4 }}>
                  Permission denied — enable mic in browser settings, then try again.
                </p>
              )}
            </div>

            {/* Notifications card */}
            <div style={{ padding: '18px', borderRadius: 12, marginBottom: 28, background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: 'rgba(102,68,238,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={18} color="#a78bfa" />
                </div>
                <div>
                  <p style={{ color: 'white', fontWeight: 600, fontSize: 14, margin: 0 }}>Daily reminder</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '3px 0 0', lineHeight: 1.5 }}>
                    Get a daily reminder so your streak doesn't break. Set a time in Profile settings.
                  </p>
                </div>
              </div>
            </div>

            <button onClick={finish}
              style={{ width: '100%', padding: '14px', borderRadius: 11, border: 'none', background: 'linear-gradient(135deg, #4422cc, #6644ee)', color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              Let's go <ChevronRight size={16} />
            </button>
            {!micGranted && (
              <button onClick={finish}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: 12, width: '100%', marginTop: 12, textAlign: 'center', padding: '4px' }}>
                Skip for now
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
