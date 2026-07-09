import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { seedDatabase } from '../lib/seedData'

/**
 * One-time admin page to seed Firestore with prompts + badges.
 * Visit /seed, click the button, then never visit again.
 * Remove this route before going to production.
 */
export default function SeedPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [message, setMessage] = useState('')

  async function handleSeed() {
    setStatus('loading')
    setMessage('')
    try {
      await seedDatabase()
      setStatus('done')
      setMessage('✅ Seeded successfully! Prompts and badges are in Firestore.')
    } catch (err) {
      setStatus('error')
      setMessage(`❌ Error: ${err.message}`)
      console.error(err)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', color: 'white', padding: 24,
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: 40, maxWidth: 480, width: '100%', textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Seed Database</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
          This will write all prompts and badges to Firestore.
          Safe to run multiple times — uses batch writes.
        </p>

        <button
          onClick={handleSeed}
          disabled={status === 'loading' || status === 'done'}
          style={{
            background: status === 'done' ? '#22c55e' : '#FF6B6B',
            color: 'white', fontWeight: 700, fontSize: 16,
            padding: '14px 32px', borderRadius: 12, border: 'none',
            cursor: status === 'loading' || status === 'done' ? 'not-allowed' : 'pointer',
            opacity: status === 'loading' ? 0.7 : 1,
            width: '100%', transition: 'opacity 0.2s',
          }}
        >
          {status === 'idle' && 'Seed Firestore'}
          {status === 'loading' && 'Seeding...'}
          {status === 'done' && 'Done ✓'}
          {status === 'error' && 'Try again'}
        </button>

        {message && (
          <p style={{
            marginTop: 20, fontSize: 14, lineHeight: 1.6,
            color: status === 'done' ? '#86efac' : '#fca5a5',
          }}>
            {message}
          </p>
        )}

        {status === 'done' && (
          <button
            onClick={() => navigate('/home')}
            style={{
              marginTop: 20, background: 'transparent', color: 'rgba(255,255,255,0.5)',
              fontSize: 14, border: 'none', cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            Go to app →
          </button>
        )}
      </div>
    </div>
  )
}
