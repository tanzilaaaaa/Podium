/**
 * EdgeCaseScreens.jsx
 * Reusable full-screen (or inline) states for:
 *   - MicDeniedScreen   — mic permission denied
 *   - UnsupportedScreen — browser lacks required APIs
 *   - OfflineBanner     — no network connection (sticky banner)
 *   - ShortRecordingBanner — recording was too short
 */

import { motion } from 'framer-motion'
import { MicOff, WifiOff, AlertTriangle, Globe } from 'lucide-react'

const S = {
  page: {
    minHeight: '100vh', background: '#0d0d1a',
    fontFamily: 'Inter, system-ui, sans-serif',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '32px 24px', textAlign: 'center',
  },
  iconWrap: (color) => ({
    width: 72, height: 72, borderRadius: '50%',
    background: `${color}14`,
    border: `1.5px solid ${color}30`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 20px',
  }),
  title: { color: 'white', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 10px' },
  body: { color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, maxWidth: 320, margin: '0 auto 24px' },
  primaryBtn: (color) => ({
    padding: '13px 28px', borderRadius: 12, border: 'none',
    background: color, color: 'white',
    fontWeight: 700, fontSize: 14, cursor: 'pointer',
  }),
  secondaryBtn: {
    marginTop: 10, padding: '12px 28px', borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.1)', background: 'none',
    color: 'rgba(255,255,255,0.45)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
  },
}

// ─── Mic denied ──────────────────────────────────────────────────────────────

export function MicDeniedScreen({ onRetry, onGoBack }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={S.page}
    >
      <div style={S.iconWrap('#ef4444')}>
        <MicOff size={30} color="#ef4444" />
      </div>
      <h2 style={S.title}>Mic access denied</h2>
      <p style={S.body}>
        Podium needs your microphone to record your reps. To fix this, open your browser's site settings and allow mic access for this page, then come back.
      </p>

      {/* Visual step guide */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, padding: '16px 20px', width: '100%', maxWidth: 340,
        textAlign: 'left', marginBottom: 24,
      }}>
        {[
          'Click the lock icon in your browser address bar',
          'Find "Microphone" in the permissions list',
          'Change it to "Allow"',
          'Refresh the page and try again',
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: i < 3 ? 10 : 0 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ef4444', fontWeight: 700, fontSize: 11,
            }}>
              {i + 1}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.5, margin: 0 }}>{step}</p>
          </div>
        ))}
      </div>

      <button onClick={onRetry} style={S.primaryBtn('#ef4444')}>Try again</button>
      {onGoBack && (
        <button onClick={onGoBack} style={S.secondaryBtn}>Go back</button>
      )}
    </motion.div>
  )
}

// ─── Unsupported browser ─────────────────────────────────────────────────────

export function UnsupportedScreen({ missing = [], onGoBack }) {
  const isSTT = missing.includes('stt')
  const isMic = missing.includes('mic')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={S.page}
    >
      <div style={S.iconWrap('#f59e0b')}>
        <Globe size={30} color="#f59e0b" />
      </div>
      <h2 style={S.title}>Browser not supported</h2>
      <p style={S.body}>
        {isSTT
          ? 'Live transcription requires the Web Speech API, which your current browser doesn\'t support.'
          : 'Your browser is missing some features Podium needs to work.'}
        {' '}For the best experience, use Chrome or Edge on desktop or Android.
      </p>

      <div style={{
        background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: 14, padding: '14px 18px', width: '100%', maxWidth: 340,
        textAlign: 'left', marginBottom: 24,
      }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
          Recommended browsers
        </p>
        {['Chrome 80+', 'Edge 80+', 'Samsung Internet 13+'].map(b => (
          <p key={b} style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {b}
          </p>
        ))}
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: '8px 0 0' }}>
          Safari has limited Web Speech API support.
        </p>
      </div>

      {onGoBack && (
        <button onClick={onGoBack} style={S.primaryBtn('#f59e0b')}>Go back</button>
      )}
    </motion.div>
  )
}

// ─── Offline banner (sticky, inline) ─────────────────────────────────────────

export function OfflineBanner() {
  return (
    <motion.div
      initial={{ y: -60 }} animate={{ y: 0 }} exit={{ y: -60 }}
      transition={{ type: 'spring', damping: 24, stiffness: 300 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
        background: '#1e293b',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
    >
      <WifiOff size={15} color="#94a3b8" />
      <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>
        You're offline — scores won't save until you reconnect
      </span>
    </motion.div>
  )
}

// ─── Short recording banner (inline, shown in RecordPage) ─────────────────────

export function ShortRecordingBanner({ minSeconds = 5, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      style={{
        background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: 14, padding: '14px 18px',
        display: 'flex', alignItems: 'flex-start', gap: 12,
        maxWidth: 340,
      }}
    >
      <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
      <div>
        <p style={{ color: '#ef4444', fontWeight: 700, fontSize: 14, margin: '0 0 3px' }}>Recording too short</p>
        <p style={{ color: 'rgba(239,68,68,0.7)', fontSize: 13, lineHeight: 1.5, margin: 0 }}>
          Speak for at least {minSeconds} seconds so we can score your rep properly.
        </p>
      </div>
    </motion.div>
  )
}

// ─── Offline full-page screen (for completely offline first load) ─────────────

export function OfflineScreen({ onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={S.page}
    >
      <div style={S.iconWrap('#64748b')}>
        <WifiOff size={30} color="#64748b" />
      </div>
      <h2 style={S.title}>No connection</h2>
      <p style={S.body}>
        Podium needs a network connection to load your prompts and save your reps. Check your connection and try again.
      </p>
      <button onClick={onRetry} style={S.primaryBtn('rgba(255,255,255,0.12)')}>Retry</button>
    </motion.div>
  )
}
