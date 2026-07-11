import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Zap, Flame, CheckCircle2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { LevelUpModal, StreakFreezeUsedModal, StreakLostModal } from '../components/Modals'
import { getLevelName } from '../lib/firestore'
import { useAuth } from '../context/useAuth'

// Highlight filler words inline in transcript text
function HighlightedTranscript({ text, fillerWords }) {
  if (!text || !fillerWords?.length) {
    return <span style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>"{text}"</span>
  }

  // Build a regex that matches any filler word (word-boundary aware)
  const fillerSet = new Set(fillerWords.map(f => f.word.toLowerCase()))
  const pattern = Array.from(fillerSet)
    .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi')

  const parts = []
  let last = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: 'text', val: text.slice(last, match.index) })
    parts.push({ type: 'filler', val: match[0] })
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push({ type: 'text', val: text.slice(last) })

  return (
    <span>
      {parts.map((p, i) =>
        p.type === 'filler' ? (
          <mark key={i} style={{
            background: 'rgba(251,191,36,0.25)', color: '#fbbf24',
            borderRadius: 3, padding: '0 2px', fontStyle: 'normal',
          }}>{p.val}</mark>
        ) : (
          <span key={i} style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>{p.val}</span>
        )
      )}
    </span>
  )
}

export default function ResultsPage() {
  const { state } = useLocation()
  const navigate  = useNavigate()
  const { profile } = useAuth()

  const [showTranscript, setShowTranscript] = useState(false)
  const [modal, setModal] = useState(null) // 'levelUp' | 'freeze' | 'lost' | null

  const { scores, repResult, duration, transcript, prompt, prevScores } = state || {}

  useEffect(() => {
    if (!scores) navigate('/home', { replace: true })
  }, [scores, navigate])

  useEffect(() => {
    if (!repResult) return
    const delay = setTimeout(() => {
      if (repResult.leveledUp)        setModal('levelUp')
      else if (repResult.usedFreeze)  setModal('freeze')
      else if (repResult.streakLost)  setModal('lost')
    }, 700)
    return () => clearTimeout(delay)
  }, [repResult])

  if (!scores) return null

  const xpEarned  = repResult?.xpEarned  ?? scores.xpEarned
  const newStreak = repResult?.newStreak ?? 0
  const leveledUp = repResult?.leveledUp

  // Deltas vs previous rep
  const clarityDelta = prevScores ? scores.clarityScore - prevScores.clarityScore : undefined
  const fillerDelta  = prevScores ? prevScores.fillerCount - scores.fillerCount   : undefined // inverted: fewer is better
  const paceDelta    = prevScores
    ? (Math.abs(scores.wpm - 140) < Math.abs(prevScores.wpm - 140) ? 1 : -1)
    : undefined

  return (
    <>
      <div style={{ minHeight: '100vh', background: '#0d0d1a', fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: 32 }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px' }}>

          {/* Header */}
          <div style={{ paddingTop: 52, marginBottom: 20 }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 3px' }}>Rep complete</p>
            <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Your results</h1>
          </div>

          {/* XP / streak banner */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            style={{
              background: 'linear-gradient(135deg, rgba(68,34,204,0.7), rgba(102,68,238,0.5))',
              border: '1px solid rgba(102,68,238,0.4)',
              borderRadius: 14, padding: '14px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={17} color="#fbbf24" />
              <span style={{ color: 'white', fontWeight: 700, fontSize: 17 }}>+{xpEarned} XP</span>
            </div>
            {leveledUp ? (
              <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 8, padding: '4px 12px' }}>
                <span style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>Level up</span>
              </div>
            ) : newStreak > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Flame size={15} color="#ef4444" />
                <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{newStreak} day streak</span>
              </div>
            ) : null}
          </motion.div>

          {/* Score tiles with prev-rep comparison */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}
          >
            <ScoreTile label="Pace"    value={scores.wpm}          unit="wpm"   score={scores.paceScore}   sub={getPaceLabel(scores.wpm)}          delta={paceDelta} />
            <ScoreTile label="Fillers" value={scores.fillerCount}  unit="words" score={scores.fillerScore} sub={getFillerLabel(scores.fillerCount)} delta={fillerDelta} />
            <ScoreTile label="Clarity" value={scores.clarityScore} unit="/100"  score={scores.clarityScore} sub="overall"                           delta={clarityDelta} />
          </motion.div>

          {/* Overall */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '14px 18px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
            }}
          >
            <div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Overall</p>
              <p style={{ color: 'white', fontWeight: 800, fontSize: 34, margin: 0, letterSpacing: '-0.02em' }}>{scores.totalScore}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Duration</p>
              <p style={{ color: 'white', fontWeight: 600, fontSize: 17, margin: 0 }}>{duration}s</p>
            </div>
          </motion.div>

          {/* New badges */}
          {repResult?.newBadges?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, type: 'spring' }}
              style={{
                background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.25)',
                borderRadius: 14, padding: '14px 16px', marginBottom: 12,
              }}
            >
              <p style={{ color: 'rgba(167,139,250,0.8)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
                Badges unlocked
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {repResult.newBadges.map(b => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 8, padding: '5px 10px' }}>
                    <CheckCircle2 size={13} color="#a78bfa" />
                    <span style={{ color: '#a78bfa', fontSize: 12, fontWeight: 600 }}>{b.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 18px', marginBottom: 12 }}
          >
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Feedback</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {scores.feedback?.map((line, i) => (
                <p key={i} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{line}</p>
              ))}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, margin: '10px 0 0', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              Scoring is heuristic — a starting point, not a verdict.
            </p>
          </motion.div>

          {/* Transcript with inline filler highlighting */}
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}
            >
              <button onClick={() => setShowTranscript(v => !v)}
                style={{ width: '100%', padding: '13px 16px', background: 'none', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>Transcript</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {scores.fillerWords?.length > 0 && (
                    <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>
                      {scores.fillerWords.length} filler{scores.fillerWords.length !== 1 ? 's' : ''} highlighted
                    </span>
                  )}
                  <ChevronRight size={15} color="rgba(255,255,255,0.3)"
                    style={{ transform: showTranscript ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
              </button>
              <AnimatePresence>
                {showTranscript && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p style={{ fontSize: 13, lineHeight: 1.8, margin: 0, padding: '0 16px 14px' }}>
                      <HighlightedTranscript text={transcript} fillerWords={scores.fillerWords} />
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* CTA */}
          <button onClick={() => navigate('/home')}
            style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: 'white', color: '#0d0d1a', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            Back to home <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {modal === 'levelUp' && (
        <LevelUpModal level={repResult.newLevel} levelName={getLevelName(repResult.newLevel)} xpEarned={xpEarned} onClose={() => setModal(null)} />
      )}
      {modal === 'freeze' && (
        <StreakFreezeUsedModal freezesLeft={profile?.streakFreezesAvailable ?? 0} onClose={() => setModal(null)} />
      )}
      {modal === 'lost' && (
        <StreakLostModal lostStreak={repResult?.previousStreak ?? 0} onClose={() => setModal(null)} />
      )}
    </>
  )
}

function ScoreTile({ label, value, unit, score, sub, delta }) {
  const color  = score >= 80 ? '#22c55e' : score >= 50 ? '#fbbf24' : '#ef4444'
  const bg     = score >= 80 ? 'rgba(34,197,94,0.08)' : score >= 50 ? 'rgba(251,191,36,0.08)' : 'rgba(239,68,68,0.08)'
  const border = score >= 80 ? 'rgba(34,197,94,0.2)' : score >= 50 ? 'rgba(251,191,36,0.2)' : 'rgba(239,68,68,0.2)'
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '12px 11px' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 2 }}>
        <span style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>{value}</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{unit}</span>
      </div>
      <p style={{ color, fontSize: 10, fontWeight: 600, margin: 0 }}>{sub}</p>
      {delta !== undefined && <DeltaChip delta={delta} />}
    </div>
  )
}

function DeltaChip({ delta }) {
  if (delta === 0 || delta === undefined) return <div style={{ height: 14, marginTop: 3 }}><Minus size={10} color="rgba(255,255,255,0.2)" /></div>
  const positive = delta > 0
  const Icon = positive ? TrendingUp : TrendingDown
  const color = positive ? '#22c55e' : '#f87171'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
      <Icon size={10} color={color} />
      <span style={{ color, fontSize: 10, fontWeight: 600 }}>{positive ? '+' : ''}{delta}</span>
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
