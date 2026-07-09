import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, Bell, ChevronRight, Check,
  Briefcase, Brain, CalendarClock, MessageCircle,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'

const GOALS = [
  { id: 'interview',  icon: Briefcase,      title: 'Interview prep',          desc: 'Nail your next job interview' },
  { id: 'anxiety',    icon: Brain,          title: 'Public speaking anxiety', desc: 'Build confidence step by step' },
  { id: 'event',      icon: CalendarClock,  title: 'Upcoming event',          desc: 'Wedding toast, conference talk, pitch' },
  { id: 'confidence', icon: MessageCircle,  title: 'General confidence',      desc: 'Become a better communicator' },
]

const variants = {
  enter:  { opacity: 0, x: 32 },
  center: { opacity: 1, x: 0  },
  exit:   { opacity: 0, x: -32 },
}

export default function OnboardingPage() {
  const { user, refreshProfile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [selectedGoals, setSelectedGoals] = useState([])
  const [micGranted, setMicGranted] = useState(false)
  const [micLoading, setMicLoading] = useState(false)
  const [micError, setMicError] = useState(false)

  function toggleGoal(id) {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
  }

  async function handleGoalsContinue() {
    if (!selectedGoals.length) return
    if (user) await updateProfile({ goals: selectedGoals }).catch(() => {})
    setStep(1)
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
      <div style={{ display: 'flex', gap: 6, marginBottom: 44 }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            width: i === step ? 20 : 6, height: 6, borderRadius: 3,
            background: i === step ? '#6644ee' : 'rgba(255,255,255,0.12)',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Step 0: Goals ── */}
        {step === 0 && (
          <motion.div
            key="goals"
            variants={variants} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.25 }}
            style={{ width: '100%', maxWidth: 480 }}
          >
            <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px', textAlign: 'center' }}>
              What are you working on?
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, textAlign: 'center', margin: '0 0 28px', lineHeight: 1.5 }}>
              We'll tailor your daily prompts based on your goal.
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

        {/* ── Step 1: Permissions ── */}
        {step === 1 && (
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
                    Used only to record your practice reps. Never stored or shared.
                  </p>
                </div>
              </div>

              {micGranted ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e', fontSize: 13, fontWeight: 600 }}>
                  <Check size={14} strokeWidth={2.5} /> Access granted
                </div>
              ) : (
                <button onClick={requestMic} disabled={micLoading}
                  style={{
                    width: '100%', padding: '10px', borderRadius: 8, border: 'none',
                    background: 'rgba(102,68,238,0.18)', color: '#a78bfa',
                    fontWeight: 600, fontSize: 13, cursor: micLoading ? 'wait' : 'pointer',
                  }}>
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
            <div style={{
              padding: '18px', borderRadius: 12, marginBottom: 28,
              background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(102,68,238,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bell size={18} color="#a78bfa" />
                </div>
                <div>
                  <p style={{ color: 'white', fontWeight: 600, fontSize: 14, margin: 0 }}>Daily reminder</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '3px 0 0', lineHeight: 1.5 }}>
                    Set a time in Profile to keep your streak going. No spam.
                  </p>
                </div>
              </div>
            </div>

            <button onClick={finish}
              style={{
                width: '100%', padding: '14px', borderRadius: 11, border: 'none',
                background: 'linear-gradient(135deg, #4422cc, #6644ee)',
                color: 'white', fontWeight: 600, fontSize: 14,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              }}>
              Let's go <ChevronRight size={16} />
            </button>
            {!micGranted && (
              <button onClick={finish}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.25)', fontSize: 12,
                  width: '100%', marginTop: 12, textAlign: 'center', padding: '4px',
                }}>
                Skip for now
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
