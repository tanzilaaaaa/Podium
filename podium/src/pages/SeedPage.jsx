import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Dev-only page — seeds the Postgres prompts table via the Go backend.
 * Visit /seed once, click the button, done.
 */
export default function SeedPage() {
  const navigate = useNavigate()
  const [status, setStatus]   = useState('idle')
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')

  async function handleSeed() {
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('http://localhost:8080/api/v1/admin/seed', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Seed failed')
      setResult(data)
      setStatus('done')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0d0d1a',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', color: 'white', padding: 24,
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: 40, maxWidth: 480, width: '100%', textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Seed Database</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
          Seeds the Postgres <code>prompts</code> table via the Go backend.
          Safe to run multiple times — skips duplicates.
        </p>

        <button
          onClick={handleSeed}
          disabled={status === 'loading' || status === 'done'}
          style={{
            background: status === 'done' ? '#22c55e' : '#6644ee',
            color: 'white', fontWeight: 700, fontSize: 15,
            padding: '13px 32px', borderRadius: 11, border: 'none',
            cursor: status === 'loading' || status === 'done' ? 'not-allowed' : 'pointer',
            opacity: status === 'loading' ? 0.7 : 1,
            width: '100%', transition: 'opacity 0.2s',
          }}
        >
          {status === 'idle'    && 'Seed prompts'}
          {status === 'loading' && 'Seeding…'}
          {status === 'done'    && 'Done'}
          {status === 'error'   && 'Try again'}
        </button>

        {result && (
          <p style={{ marginTop: 20, fontSize: 14, color: '#86efac', lineHeight: 1.6 }}>
            Inserted {result.inserted} of {result.total} prompts into Postgres.
          </p>
        )}

        {error && (
          <p style={{ marginTop: 20, fontSize: 13, color: '#fca5a5' }}>{error}</p>
        )}

        {status === 'done' && (
          <button onClick={() => navigate('/home')}
            style={{ marginTop: 16, background: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Go to app
          </button>
        )}
      </div>
    </div>
  )
}
