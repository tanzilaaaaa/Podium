import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Mic } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { getReps } from '../lib/api'

const CATEGORY_STYLES = {
  persuasion:   { bg: 'rgba(168,85,247,0.15)', text: '#c084fc', border: 'rgba(168,85,247,0.3)' },
  storytelling: { bg: 'rgba(59,130,246,0.15)', text: '#93c5fd', border: 'rgba(59,130,246,0.3)' },
  impromptu:    { bg: 'rgba(34,197,94,0.15)',  text: '#86efac', border: 'rgba(34,197,94,0.3)'  },
  interview:    { bg: 'rgba(251,146,60,0.15)', text: '#fdba74', border: 'rgba(251,146,60,0.3)' },
}

export default function HistoryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reps, setReps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getReps(50).then(r => setReps(r.reps || [])).finally(() => setLoading(false))
  }, [user])

  const avgScore = reps.length ? Math.round(reps.reduce((s, r) => s + (r.clarityScore || 0), 0) / reps.length) : 0
  const avgWpm = reps.length ? Math.round(reps.reduce((s, r) => s + (r.wpm || 0), 0) / reps.length) : 0

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d1a', fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px' }}>

        {/* Header */}
        <div style={{ paddingTop: 52, marginBottom: 20 }}>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: 0 }}>History</h1>
        </div>

        {/* Stats summary */}
        {reps.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { value: reps.length, label: 'Total reps' },
              { value: avgWpm,      label: 'Avg wpm'    },
              { value: avgScore,    label: 'Avg clarity' },
            ].map(({ value, label }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '14px 12px', textAlign: 'center',
              }}>
                <p style={{ color: 'white', fontWeight: 800, fontSize: 22, margin: '0 0 3px' }}>{value}</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #6644ee', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : reps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Mic size={24} color="rgba(255,255,255,0.3)" />
            </div>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 17, margin: '0 0 8px' }}>No reps yet</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Complete your first recording to see your history here.</p>
            <button onClick={() => navigate('/home')}
              style={{ marginTop: 20, padding: '12px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #4422cc, #6644ee)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
              Start now
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reps.map((rep, i) => {
              const prev = reps[i + 1]
              const improved = prev && rep.clarityScore > prev.clarityScore
              const d = rep.createdAt
              const ms = d?.seconds ? d.seconds * 1000 : d ? new Date(d).getTime() : 0
              const date = ms ? new Date(ms) : null
              const cs = CATEGORY_STYLES[rep.category] || CATEGORY_STYLES.impromptu

              return (
                <div key={rep.id} style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 14, padding: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                    <p style={{ color: 'white', fontSize: 14, fontWeight: 500, lineHeight: 1.45, flex: 1, margin: 0 }}>
                      {rep.promptText}
                    </p>
                    {improved && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                        <TrendingUp size={13} color="#22c55e" />
                        <span style={{ color: '#22c55e', fontSize: 11, fontWeight: 600 }}>Improved</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    {rep.category && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20,
                        background: cs.bg, color: cs.text, border: `1px solid ${cs.border}`,
                        textTransform: 'capitalize',
                      }}>
                        {rep.category}
                      </span>
                    )}
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{rep.wpm} wpm</span>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{rep.fillerCount} fillers</span>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>clarity {rep.clarityScore}</span>
                    {rep.xpEarned && <span style={{ color: '#fbbf24', fontSize: 12, fontWeight: 600 }}>+{rep.xpEarned} XP</span>}
                  </div>

                  {date && (
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, margin: '8px 0 0' }}>
                      {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
