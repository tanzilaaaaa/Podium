import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, Zap, Shield, ChevronRight, Bell, Sun, Moon, Flame, Snowflake } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useTheme, tokens } from '../context/ThemeContext'
import { getLevelName, getLevelProgress, getXpToNextLevel, LEVELS } from '../lib/firestore'

export default function ProfilePage() {
  const { user, profile, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const t = tokens(theme)
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await logout()
    navigate('/auth')
  }

  const level = profile?.level || 1
  const xp = profile?.xp || 0
  const levelName = getLevelName(level)
  const xpProgress = getLevelProgress(xp, level)
  const xpToNext = getXpToNextLevel(xp, level)
  const nextLevel = LEVELS.find(l => l.level === level + 1)

  const initials = (profile?.displayName || user?.displayName || 'S')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: 100 }}>
      {/* Hero */}
      <div style={{
        background: theme === 'dark'
          ? 'linear-gradient(180deg, rgba(68,34,204,0.25) 0%, transparent 100%)'
          : 'linear-gradient(180deg, rgba(68,34,204,0.06) 0%, transparent 100%)',
        padding: '52px 20px 24px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{
              width: 68, height: 68, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4422cc, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 24,
              boxShadow: '0 0 0 3px rgba(167,139,250,0.2)',
            }}
          >
            {initials}
          </motion.div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: t.text, fontWeight: 700, fontSize: 18, margin: '0 0 2px' }}>
              {profile?.displayName || user?.displayName || 'Speaker'}
            </h1>
            <p style={{ color: t.textSec, fontSize: 13, margin: 0 }}>{user?.email}</p>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 20,
            background: t.accentBg, border: `1px solid ${t.accentBorder}`,
          }}>
            <Zap size={12} color={t.accentLight} />
            <span style={{ color: t.accentLight, fontWeight: 600, fontSize: 12 }}>
              Lv.{level} · {levelName}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* XP bar */}
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
            <span style={{ color: t.textSec, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>XP Progress</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Zap size={12} color="#f59e0b" />
              <span style={{ color: t.text, fontWeight: 700, fontSize: 13 }}>{xp.toLocaleString()}</span>
              {xpToNext && <span style={{ color: t.textTer, fontSize: 12 }}>/ {(xp + xpToNext).toLocaleString()}</span>}
            </div>
          </div>
          <div style={{ height: 5, background: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', borderRadius: 3, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }}
              transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #4422cc, #a78bfa)', borderRadius: 3 }}
            />
          </div>
          {xpToNext && <p style={{ color: t.textTer, fontSize: 11, margin: '7px 0 0' }}>{xpToNext.toLocaleString()} XP to {nextLevel?.name}</p>}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[
            { icon: <Flame size={16} color="#ef4444" />, value: profile?.streakCount || 0, label: 'Streak' },
            { icon: <Snowflake size={16} color="#60a5fa" />, value: profile?.streakFreezesAvailable ?? 1, label: 'Freezes' },
            { icon: <Zap size={16} color="#f59e0b" />, value: xp, label: 'Total XP' },
          ].map(({ icon, value, label }) => (
            <div key={label} style={{
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: 12, padding: '12px', textAlign: 'center',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{icon}</div>
              <p style={{ color: t.text, fontWeight: 700, fontSize: 18, margin: '0 0 2px' }}>{value}</p>
              <p style={{ color: t.textTer, fontSize: 11, margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Settings rows */}
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
          <SettingsRow
            icon={theme === 'dark' ? <Sun size={15} color={t.accentLight} /> : <Moon size={15} color={t.accentLight} />}
            label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            sub="Switch appearance"
            onPress={toggle}
            t={t}
          />
          <SettingsRow icon={<Bell size={15} color={t.accentLight} />} label="Notifications" sub="Daily reminder" onPress={() => {}} t={t} last />
        </div>

        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
          <SettingsRow icon={<Shield size={15} color={t.accentLight} />} label="Privacy" sub="Voice recordings stay local" onPress={() => {}} t={t} last />
        </div>

        {/* About */}
        <div style={{
          background: t.bgCard, border: `1px solid ${t.border}`,
          borderRadius: 14, padding: '14px 16px', marginBottom: 12,
        }}>
          <p style={{ color: t.textSec, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>About</p>
          <p style={{ color: t.textSec, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            Podium v1 scoring uses heuristic algorithms — pace, filler words, and a clarity proxy. It's a tool to build the habit, not a clinical assessment.
          </p>
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            width: '100%', padding: '13px', borderRadius: 12,
            border: `1px solid ${theme === 'dark' ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.15)'}`,
            background: theme === 'dark' ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.04)',
            color: '#ef4444', fontWeight: 600, fontSize: 14,
            cursor: loggingOut ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            opacity: loggingOut ? 0.6 : 1,
          }}
        >
          <LogOut size={15} />
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  )
}

function SettingsRow({ icon, label, sub, onPress, t, last }) {
  return (
    <button onClick={onPress}
      style={{
        width: '100%', padding: '13px 16px', background: 'none',
        border: 'none', borderBottom: last ? 'none' : `1px solid ${t.border}`,
        display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left',
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: t.accentBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ color: t.text, fontWeight: 600, fontSize: 13, margin: 0 }}>{label}</p>
        {sub && <p style={{ color: t.textTer, fontSize: 12, margin: '1px 0 0' }}>{sub}</p>}
      </div>
      <ChevronRight size={15} color={t.textTer} />
    </button>
  )
}
