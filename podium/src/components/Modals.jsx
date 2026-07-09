/**
 * Modals.jsx — Level-up, Streak-freeze, Streak-lost
 * All modals share the same backdrop + slide-up animation pattern.
 * Usage:
 *   <LevelUpModal level={5} levelName="Confident Speaker" onClose={() => {}} />
 *   <StreakFreezeModal freezesLeft={1} onUse={() => {}} onSkip={() => {}} />
 *   <StreakLostModal onClose={() => {}} onNavigate={() => navigate('/home')} />
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Snowflake, Flame } from 'lucide-react'

// ─── Shared backdrop + sheet ─────────────────────────────────────────────────

function ModalSheet({ children, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}
      >
        <motion.div
          key="sheet"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 340 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 480,
            background: '#141428',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px 24px 0 0',
            padding: '28px 24px 40px',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Drag handle */}
          <div style={{
            width: 36, height: 4, borderRadius: 2,
            background: 'rgba(255,255,255,0.15)',
            margin: '0 auto 24px',
          }} />
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Level-up modal ──────────────────────────────────────────────────────────

export function LevelUpModal({ level, levelName, xpEarned, onClose }) {
  return (
    <ModalSheet onClose={onClose}>
      {/* Animated glow orb */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4422cc, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 40px rgba(167,139,250,0.5)',
          }}
        >
          <Zap size={36} color="white" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ color: '#a78bfa', fontWeight: 800, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}
        >
          Level up!
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ color: 'white', fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 6px' }}
        >
          Level {level}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, margin: 0 }}
        >
          {levelName}
        </motion.p>
      </div>

      {/* XP chip */}
      {xpEarned && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)',
            borderRadius: 12, padding: '12px', marginBottom: 24,
          }}
        >
          <Zap size={16} color="#fbbf24" />
          <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>+{xpEarned} XP earned</span>
        </motion.div>
      )}

      <button
        onClick={onClose}
        style={{
          width: '100%', padding: '15px', borderRadius: 14, border: 'none',
          background: 'linear-gradient(135deg, #4422cc, #7744ff)',
          color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer',
        }}
      >
        Keep going 🚀
      </button>
    </ModalSheet>
  )
}

// ─── Streak-freeze modal ─────────────────────────────────────────────────────

export function StreakFreezeModal({ freezesLeft, onUse, onSkip }) {
  return (
    <ModalSheet onClose={onSkip}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 40px rgba(56,189,248,0.4)',
          }}
        >
          <Snowflake size={36} color="white" />
        </motion.div>

        <p style={{ color: '#38bdf8', fontWeight: 800, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>
          Streak at risk
        </p>
        <h2 style={{ color: 'white', fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
          Use a Streak Freeze?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          You missed yesterday. Use one of your {freezesLeft} streak freeze{freezesLeft !== 1 ? 's' : ''} to protect your streak.
        </p>
      </div>

      {/* Freeze count */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)',
        borderRadius: 12, padding: '12px', marginBottom: 20,
      }}>
        <Snowflake size={16} color="#38bdf8" />
        <span style={{ color: 'white', fontWeight: 700 }}>{freezesLeft} freeze{freezesLeft !== 1 ? 's' : ''} remaining</span>
      </div>

      <button
        onClick={onUse}
        style={{
          width: '100%', padding: '15px', borderRadius: 14, border: 'none',
          background: 'linear-gradient(135deg, #0369a1, #0ea5e9)',
          color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 10,
        }}
      >
        🧊 Use streak freeze
      </button>
      <button
        onClick={onSkip}
        style={{
          width: '100%', padding: '14px', borderRadius: 14,
          background: 'none', border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
        }}
      >
        Skip — reset my streak
      </button>
    </ModalSheet>
  )
}

// ─── Streak-lost modal ───────────────────────────────────────────────────────

export function StreakLostModal({ lostStreak, onClose }) {
  return (
    <ModalSheet onClose={onClose}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(239,68,68,0.15)',
            border: '2px solid rgba(239,68,68,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <Flame size={36} color="#ef4444" />
        </motion.div>

        <p style={{ color: '#ef4444', fontWeight: 800, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>
          Streak lost
        </p>
        <h2 style={{ color: 'white', fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
          {lostStreak > 0 ? `${lostStreak}-day streak gone` : 'Your streak broke'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          It happens. The best speakers don't quit after a miss — they just start again. Today's rep starts a new streak.
        </p>
      </div>

      {/* Motivational stat */}
      {lostStreak > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 12, padding: '12px', marginBottom: 20, textAlign: 'center',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 2px' }}>Previous best</p>
          <p style={{ color: 'white', fontWeight: 800, fontSize: 20, margin: 0 }}>{lostStreak} days 🔥</p>
        </div>
      )}

      <button
        onClick={onClose}
        style={{
          width: '100%', padding: '15px', borderRadius: 14, border: 'none',
          background: 'linear-gradient(135deg, #4422cc, #7744ff)',
          color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 10,
        }}
      >
        Start fresh today
      </button>
    </ModalSheet>
  )
}
