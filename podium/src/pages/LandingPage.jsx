import { useNavigate } from 'react-router-dom'
import { Mic } from 'lucide-react'
import { motion } from 'framer-motion'
import Ballpit from '../components/Ballpit'
import BlurText from '../components/BlurText'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#0d0d1a',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>

      {/* ── Ballpit ──────────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Ballpit
          count={160}
          gravity={0}
          friction={0.9975}
          wallBounce={0.95}
          followCursor={true}
        />
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 28px',
      }}>
        {/* Logo — white bg, dark mic */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Mic size={16} color="#0d0d1a" strokeWidth={2.5} />
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>
            Podium
          </span>
        </div>

        {/* Nav right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer',
            transition: 'color 0.15s' }}
            onMouseEnter={e => e.target.style.color='rgba(255,255,255,0.9)'}
            onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.5)'}
          >
            Features
          </span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer',
            transition: 'color 0.15s' }}
            onMouseEnter={e => e.target.style.color='rgba(255,255,255,0.9)'}
            onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.5)'}
          >
            About
          </span>
          <button
            onClick={() => navigate('/auth?mode=signin')}
            style={{
              background: 'white', color: '#0d0d1a',
              fontWeight: 600, fontSize: 14,
              padding: '8px 20px', borderRadius: 8,
              border: 'none', cursor: 'pointer',
              transition: 'opacity 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity='0.88'; e.currentTarget.style.transform='scale(0.98)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='scale(1)' }}
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 20,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '0 24px',
        pointerEvents: 'none',
      }}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 999, padding: '6px 16px',
            marginBottom: 28, pointerEvents: 'auto',
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500 }}>
            Daily reps. Real progress.
          </span>
        </motion.div>

        {/* Headline — blur reveal */}
        <h1 style={{
          color: 'white',
          fontWeight: 800,
          fontSize: 'clamp(36px, 6.5vw, 68px)',
          lineHeight: 1.08,
          letterSpacing: '-0.03em',
          marginBottom: 22,
          pointerEvents: 'none',
        }}>
          <BlurText text="Speak better." delay={220} startDelay={200} duration={1.8} />
          <br />
          <BlurText text="Every day." delay={220} startDelay={1000} duration={1.8} />
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: 'clamp(14px, 1.4vw, 17px)',
            maxWidth: 460, lineHeight: 1.65,
            marginBottom: 36,
            pointerEvents: 'none',
          }}
        >
          60-second daily speaking reps. Instant scoring on pace, filler words and clarity.
          Build the habit. Watch the numbers move.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, pointerEvents: 'auto' }}
        >
          <button
            onClick={() => navigate('/auth?mode=signup')}
            style={{
              background: 'white', color: '#0d0d1a',
              fontWeight: 700, fontSize: 15,
              padding: '13px 30px', borderRadius: 10,
              border: 'none', cursor: 'pointer',
              transition: 'transform 0.15s, opacity 0.15s',
              boxShadow: '0 4px 24px rgba(167,139,250,0.25)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='scale(1.03)'; e.currentTarget.style.opacity='0.92' }}
            onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.opacity='1' }}
          >
            Get started
          </button>
          <button
            onClick={() => navigate('/auth?mode=signin')}
            style={{
              background: 'rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 500, fontSize: 15,
              padding: '13px 30px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.12)',
              cursor: 'pointer', backdropFilter: 'blur(6px)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.13)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.07)'}
          >
            Learn more
          </button>
        </motion.div>
      </div>
    </div>
  )
}
