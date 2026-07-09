import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Zap, Flame } from 'lucide-react'
import { LevelUpModal } from '../components/Modals'

export default function ResultsPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [showTranscript, setShowTranscript] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)

  const { scores, repResult, duration, transcript, prompt } = state || {}

  // Guard: if someone navigates here directly without state, bounce home
  useEffect(() => {
    if (!scores) navigate('/home', { replace: true })
  }, [scores, navigate])

  useEffect(() => {
    if (repResult?.leveledUp) {
      const t = setTimeout(() => setShowLevelUp(true), 600)
      return () => clearTimeout(t)
    }
  }, [repResult])

  if (!scores) return null

  const xpEarned = repResult?.xpEarned ?? scores.xpEarned
  const leveledUp = repResult?.leveledUp
  const newStreak = repResult?.newStreak

  return (
    <>
      <div style={{ minHeight: '100vh', background: '#0d0d1a', fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: 32 }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px' }}>
          {/* Header */}
          <div style={{ paddingTop: 52, marginBottom: 24 }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 4px' }}>Rep complete</p>
            <h1 style={{ color: 'white', fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
              Your results
            </h1>
          </div>

          {/* XP / streak banner */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            style={{
              background: 'linear-gradient(135deg, rgba(68,34,204,0.7), rgba(102,68,238,0.5))',
              border: '1px solid rgba(102,68,238,0.4)',
              borderRadius: 16, padding: '16px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} color="#fbbf24" />
              <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>+{xpEarned} XP</span>
            </div>
            {leveledUp ? (
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '5px 12px' }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>Level up! 🎉</span>
              </div>
            ) : newStreak > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Flame size={16} color="#ff6b6b" />
                <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{newStreak} day streak</span>
              </div>
            ) : null}
          </motion.div>

          {/* Score tiles */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}
          >
            <ScoreTile label="Pace" value={scores.wpm} unit="wpm" score={scores.paceScore} sub={getPaceLabel(scores.wpm)} />
            <ScoreTile label="Fillers" value={scores.fillerCount} unit="words" score={scores.fillerScore} sub={getFillerLabel(scores.fillerCount)} />
            <ScoreTile label="Clarity" value={scores.clarityScore} unit="/100" score={scores.clarityScore} sub="heuristic" />
          </motion.div>

          {/* Overall */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '16px 18px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Overall score</p>
              <p style={{ color: 'white', fontWeight: 900, fontSize: 36, margin: 0, letterSpacing: '-0.02em' }}>{scores.totalScore}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Duration</p>
              <p style={{ color: 'white', fontWeight: 700, fontSize: 18, margin: 0 }}>{duration}s</p>
            </div>
          </motion.div>

          {/* Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '16px 18px', marginBottom: 14,
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>Feedback</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {scores.feedback.map((line, i) => (
                <p key={i} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>• {line}</p>
              ))}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, margin: '12px 0 0', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              v1 scoring is a heuristic proxy. It's a starting point, not a verdict.
            </p>
          </motion.div>

          {/* Filler words */}
          {scores.fillerWords?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '16px 18px', marginBottom: 14,
              }}
            >
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Filler words</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {scores.fillerWords.map(({ word, count }) => (
                  <span key={word} style={{
                    background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)',
                    color: '#fbbf24', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 8,
                  }}>
                    "{word}" ×{count}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Transcript */}
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, overflow: 'hidden', marginBottom: 20,
              }}
            >
              <button
                onClick={() => setShowTranscript(v => !v)}
                style={{
                  width: '100%', padding: '14px 18px', background: 'none', border: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>Your transcript</span>
                <ChevronRight
                  size={16} color="rgba(255,255,255,0.3)"
                  style={{ transform: showTranscript ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
                />
              </button>
              <AnimatePresence>
                {showTranscript && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.7, margin: 0, padding: '0 18px 16px', fontStyle: 'italic' }}>
                      "{transcript}"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Done */}
          <button
            onClick={() => navigate('/home')}
            style={{
              width: '100%', padding: '15px', borderRadius: 14, border: 'none',
              background: 'white', color: '#0d0d1a', fontWeight: 700, fontSize: 15,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            Back to home <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Level-up modal */}
      {showLevelUp && (
        <LevelUpModal
          level={repResult.newLevel}
          levelName={repResult.levelName || `Level ${repResult.newLevel}`}
          xpEarned={xpEarned}
          onClose={() => setShowLevelUp(false)}
        />
      )}
    </>
  )
}

function ScoreTile({ label, value, unit, score, sub }) {
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#fbbf24' : '#ef4444'
  const bg = score >= 80 ? 'rgba(34,197,94,0.08)' : score >= 50 ? 'rgba(251,191,36,0.08)' : 'rgba(239,68,68,0.08)'
  const border = score >= 80 ? 'rgba(34,197,94,0.2)' : score >= 50 ? 'rgba(251,191,36,0.2)' : 'rgba(239,68,68,0.2)'

  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: '14px 12px' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 4 }}>
        <span style={{ color: 'white', fontWeight: 800, fontSize: 22 }}>{value}</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{unit}</span>
      </div>
      <p style={{ color, fontSize: 11, fontWeight: 600, margin: 0 }}>{sub}</p>
    </div>
  )
}

function getPaceLabel(wpm) {
  if (wpm < 100) return 'Too slow'
  if (wpm < 120) return 'A bit slow'
  if (wpm <= 160) return 'Great pace'
  if (wpm <= 180) return 'A bit fast'
  return 'Too fast'
}

function getFillerLabel(count) {
  if (count === 0) return 'Clean!'
  if (count <= 2) return 'Solid'
  if (count <= 5) return 'Improve this'
  return 'Work on it'
}
