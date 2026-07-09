import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart2 } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useTheme, tokens } from '../context/ThemeContext'
import { getReps } from '../lib/api'

const METRICS = [
  { key: 'clarityScore', label: 'Clarity', color: '#a78bfa' },
  { key: 'wpm',          label: 'Pace',    color: '#60a5fa' },
  { key: 'fillerCount',  label: 'Fillers', color: '#f87171' },
]

function CustomTooltip({ active, payload, label, t }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 14px', boxShadow: t.shadow }}>
      <p style={{ color: t.textSec, fontSize: 11, margin: '0 0 3px' }}>{label}</p>
      <p style={{ color: t.text, fontWeight: 700, fontSize: 16, margin: 0 }}>{payload[0].value}</p>
    </div>
  )
}

export default function ProgressPage() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const t = tokens(theme)
  const navigate = useNavigate()
  const [reps, setReps] = useState([])
  const [activeMetric, setActiveMetric] = useState('clarityScore')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getReps(30).then(r => { setReps(r.reps || []); setLoading(false) })
  }, [user])

  const chartData = [...reps].reverse().map((r, i) => ({
    name: `${i + 1}`,
    clarityScore: r.clarityScore || 0,
    wpm: r.wpm || 0,
    fillerCount: r.fillerCount || 0,
  }))

  const metric = METRICS.find(m => m.key === activeMetric)
  const today = new Date()
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (29 - i))
    return d.toDateString()
  })
  const repDays = new Set(reps.map(r =>
    r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toDateString() : null
  ))

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: 100 }}>
      <div style={{ padding: '52px 20px 0', marginBottom: 20 }}>
        <h1 style={{ color: t.text, fontSize: 22, fontWeight: 700, margin: 0 }}>Progress</h1>
      </div>

      <div style={{ padding: '0 20px' }}>
        {reps.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: t.bgCard,
              border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <BarChart2 size={24} color={t.textSec} />
            </div>
            <p style={{ color: t.text, fontWeight: 600, fontSize: 16, margin: '0 0 6px' }}>No data yet</p>
            <p style={{ color: t.textSec, fontSize: 13, margin: '0 0 20px', lineHeight: 1.6 }}>
              Complete a few reps to see your trend charts.
            </p>
            <button onClick={() => navigate('/home')}
              style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: t.accent, color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              Start a rep
            </button>
          </div>
        ) : (
          <>
            {/* Metric tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {METRICS.map(m => (
                <button key={m.key} onClick={() => setActiveMetric(m.key)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                    border: `1px solid ${activeMetric === m.key ? m.color : t.border}`,
                    background: activeMetric === m.key ? `${m.color}18` : 'transparent',
                    color: activeMetric === m.key ? m.color : t.textSec,
                  }}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Chart */}
            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: '16px', marginBottom: 14 }}>
              <p style={{ color: t.textSec, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>
                {metric?.label} over time
              </p>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={metric?.color} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={metric?.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fill: t.textTer, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: t.textTer, fontSize: 10 }} axisLine={false} tickLine={false} width={26} />
                  <Tooltip content={<CustomTooltip t={t} />} />
                  <Area type="monotone" dataKey={activeMetric} stroke={metric?.color} strokeWidth={2} fill="url(#grad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 30-day calendar */}
            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: '16px', marginBottom: 14 }}>
              <p style={{ color: t.textSec, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>
                30-day activity
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 5 }}>
                {days.map((day, i) => {
                  const done = repDays.has(day)
                  const isToday = day === today.toDateString()
                  return (
                    <div key={i} title={day} style={{
                      width: '100%', aspectRatio: '1', borderRadius: 5,
                      background: done
                        ? t.accent
                        : theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                      border: isToday ? `1.5px solid ${t.accentLight}` : 'none',
                      transition: 'background 0.2s',
                    }} />
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 9, height: 9, borderRadius: 2, background: t.accent }} />
                  <span style={{ color: t.textTer, fontSize: 11 }}>Done</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 9, height: 9, borderRadius: 2, background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
                  <span style={{ color: t.textTer, fontSize: 11 }}>Missed</span>
                </div>
              </div>
            </div>

            {/* Rep list */}
            <p style={{ color: t.textSec, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>Past reps</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {reps.map(rep => {
                const date = rep.createdAt?.seconds ? new Date(rep.createdAt.seconds * 1000) : null
                return (
                  <div key={rep.id} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: '13px 15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <p style={{ color: t.text, fontSize: 13, fontWeight: 500, margin: 0, flex: 1, paddingRight: 10, lineHeight: 1.4 }}>
                        {rep.promptText?.slice(0, 60)}{rep.promptText?.length > 60 ? '…' : ''}
                      </p>
                      <span style={{ color: t.textTer, fontSize: 11, flexShrink: 0 }}>
                        {date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ color: t.textSec, fontSize: 12 }}>Clarity {rep.clarityScore}</span>
                      <span style={{ color: t.textSec, fontSize: 12 }}>{rep.fillerCount} fillers</span>
                      <span style={{ color: t.textSec, fontSize: 12 }}>{rep.wpm} wpm</span>
                      {rep.xpEarned && <span style={{ color: '#f59e0b', fontSize: 12, fontWeight: 600 }}>+{rep.xpEarned} XP</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
