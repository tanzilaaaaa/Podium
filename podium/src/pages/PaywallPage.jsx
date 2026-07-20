import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Check, X, Zap, Flame, BarChart2, Star, Mic } from 'lucide-react'

const FEATURES_FREE = [
  '1 prompt per day',
  'Basic pace & filler scoring',
  '7-day history',
]

const FEATURES_PRO = [
  'Unlimited daily reps',
  'Full prompt library (100+)',
  'AI-powered coaching tips',
  'Advanced clarity breakdown',
  'Unlimited history & trends',
  'Streak freeze restores',
  'Priority new features',
]

const PLANS = [
  { id: 'monthly', label: 'Monthly', price: '$7.99', sub: 'per month', badge: null },
  { id: 'annual',  label: 'Annual',  price: '$3.99', sub: 'per month · billed $47.88/yr', badge: 'Best value · Save 50%' },
]

function PlanCard({ plan, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      style={{
        width: '100%', padding: '16px', borderRadius: 14, textAlign: 'left',
        background: selected ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.03)',
        border: `1.5px solid ${selected ? '#a78bfa' : 'rgba(255,255,255,0.08)'}`,
        cursor: 'pointer', position: 'relative', transition: 'all 0.15s',
      }}
    >
      {plan.badge && (
        <div style={{
          position: 'absolute', top: -10, right: 14,
          padding: '3px 10px', borderRadius: 20,
          background: 'linear-gradient(135deg, #4422cc, #a78bfa)',
          color: 'white', fontSize: 11, fontWeight: 700,
        }}>
          {plan.badge}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: 'white', fontWeight: 700, fontSize: 15, margin: '0 0 2px' }}>{plan.label}</p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: 0 }}>{plan.sub}</p>
        </div>
        <span style={{ color: selected ? '#a78bfa' : 'white', fontWeight: 800, fontSize: 20 }}>{plan.price}</span>
      </div>
    </button>
  )
}

export default function PaywallPage() {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState('annual')

  return (
    <div style={{
      minHeight: '100vh', background: '#0d0d1a',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Close */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute', top: 20, right: 20, zIndex: 10,
          width: 34, height: 34, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <X size={16} color="rgba(255,255,255,0.5)" />
      </button>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, rgba(68,34,204,0.5) 0%, transparent 100%)', padding: '56px 24px 28px', textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}
          style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'linear-gradient(135deg, #4422cc, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 12px 40px rgba(68,34,204,0.5)',
          }}
        >
          <Mic size={30} color="white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ color: 'white', fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 8px' }}
        >
          Unlock Podium Pro
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, margin: 0, lineHeight: 1.5 }}
        >
          Everything you need to become a confident speaker, faster.
        </motion.p>
      </div>

      <div style={{ padding: '0 20px', flex: 1 }}>
        {/* Feature comparison */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}
        >
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: 13, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Free</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FEATURES_FREE.map(f => (
                <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Check size={13} color="#22c55e" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 16, padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Zap size={12} color="#a78bfa" />
              <p style={{ color: '#a78bfa', fontWeight: 700, fontSize: 13, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pro</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FEATURES_PRO.map(f => (
                <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Check size={13} color="#a78bfa" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}
        >
          {[
            { icon: <Flame size={16} color="#ff6b6b" />, value: '12,000+', label: 'Active users' },
            { icon: <BarChart2 size={16} color="#a78bfa" />, value: '380K', label: 'Reps done' },
            { icon: <Star size={16} color="#f59e0b" />, value: '4.8', label: 'App rating' },
          ].map(({ icon, value, label }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12, padding: '12px', textAlign: 'center',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>{icon}</div>
              <p style={{ color: 'white', fontWeight: 800, fontSize: 15, margin: '0 0 2px' }}>{value}</p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, margin: 0 }}>{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Pricing plans */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}
        >
          {PLANS.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlan === plan.id}
              onSelect={() => setSelectedPlan(plan.id)}
            />
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{
            width: '100%', padding: '16px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #4422cc, #7744ff)',
            color: 'white', fontWeight: 700, fontSize: 16,
            cursor: 'pointer', marginBottom: 10,
            boxShadow: '0 8px 32px rgba(68,34,204,0.4)',
          }}
        >
          Start 7-day free trial
        </motion.button>

        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, textAlign: 'center', margin: '0 0 32px', lineHeight: 1.5 }}>
          Cancel anytime · No charges during trial · Billed after trial ends
        </p>
      </div>
    </div>
  )
}
