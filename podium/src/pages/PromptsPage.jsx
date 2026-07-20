import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { PROMPTS } from '../lib/seedData'

const CATEGORIES = ['all', 'persuasion', 'storytelling', 'impromptu', 'interview']

const CATEGORY_STYLES = {
  persuasion:   { bg: 'rgba(168,85,247,0.15)',  text: '#c084fc', border: 'rgba(168,85,247,0.3)' },
  storytelling: { bg: 'rgba(59,130,246,0.15)',  text: '#93c5fd', border: 'rgba(59,130,246,0.3)' },
  impromptu:    { bg: 'rgba(34,197,94,0.15)',   text: '#86efac', border: 'rgba(34,197,94,0.3)'  },
  interview:    { bg: 'rgba(251,146,60,0.15)',  text: '#fdba74', border: 'rgba(251,146,60,0.3)' },
}

const DIFFICULTY_LABELS = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }

export default function PromptsPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = activeCategory === 'all'
    ? PROMPTS
    : PROMPTS.filter(p => p.category === activeCategory)

  function pickRandom() {
    const prompt = filtered[Math.floor(Math.random() * filtered.length)]
    navigate('/record', { state: { prompt } })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d1a', fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px' }}>

        {/* Header */}
        <div style={{ paddingTop: 52, marginBottom: 20 }}>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: 0 }}>Prompts</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '4px 0 0' }}>
            {PROMPTS.length} prompts across {CATEGORIES.length - 1} categories
          </p>
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 16, paddingBottom: 4 }}>
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat
            const count = cat === 'all' ? PROMPTS.length : PROMPTS.filter(p => p.category === cat).length
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{
                  flexShrink: 0, padding: '7px 14px', borderRadius: 20,
                  border: `1px solid ${active ? '#a78bfa' : 'rgba(255,255,255,0.1)'}`,
                  background: active ? 'rgba(167,139,250,0.15)' : 'transparent',
                  color: active ? '#a78bfa' : 'rgba(255,255,255,0.45)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s', textTransform: 'capitalize',
                }}>
                {cat === 'all' ? `All (${count})` : `${cat} (${count})`}
              </button>
            )
          })}
        </div>

        {/* Random pick */}
        <button onClick={pickRandom}
          style={{
            width: '100%', padding: '13px', marginBottom: 16, borderRadius: 14,
            border: '1.5px dashed rgba(167,139,250,0.35)',
            background: 'rgba(167,139,250,0.05)',
            color: '#a78bfa', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
          Pick a random {activeCategory !== 'all' ? activeCategory : ''} prompt
        </button>

        {/* Prompt list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((prompt, i) => {
            const cs = CATEGORY_STYLES[prompt.category] || CATEGORY_STYLES.impromptu
            return (
              <button key={i} onClick={() => navigate('/record', { state: { prompt } })}
                style={{
                  width: '100%', padding: '16px 18px', borderRadius: 14, textAlign: 'left',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                  cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12,
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'white', fontSize: 14, lineHeight: 1.55, margin: '0 0 8px', fontWeight: 500 }}>
                    {prompt.text}
                  </p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20,
                      background: cs.bg, color: cs.text, border: `1px solid ${cs.border}`,
                      textTransform: 'capitalize',
                    }}>
                      {prompt.category}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                      {DIFFICULTY_LABELS[prompt.difficulty] || 'Medium'}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0, marginTop: 2 }} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
