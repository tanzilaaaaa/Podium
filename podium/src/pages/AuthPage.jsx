import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/useAuth'

const PURPLE = '#4422cc'
const PURPLE_DARK = '#3311aa'
const PURPLE_LIGHT = '#6644ee'

function ShinyText({ children, style = {}, as: Tag = 'span' }) {
  const ref = useRef(null)
  const [shine, setShine] = useState(null)

  function onMouseMove(e) {
    const rect = ref.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setShine({ x, y })
  }
  function onMouseLeave() { setShine(null) }

  const shineStyle = shine ? {
    backgroundImage: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.95) 0%, rgba(200,180,255,0.7) 30%, transparent 70%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  } : {}

  return (
    <Tag ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
      style={{ cursor: 'default', transition: 'all 0.15s', ...style, ...shineStyle }}>
      {children}
    </Tag>
  )
}

export default function AuthPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(() => searchParams.get('mode') === 'signin' ? 'signin' : 'signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGoogle() {
    setError(''); setLoading(true)
    try { await signInWithGoogle(); navigate('/home') }
    catch (err) {
      console.error(err)
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError('This email is registered with a different sign-in method. Please use email/password.')
      } else {
        setError('Google sign-in failed. Please try again.')
      }
    }
    finally { setLoading(false) }
  }

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      if (mode === 'signup') {
        if (!displayName.trim()) { setError('Please enter your name.'); setLoading(false); return }
        await signUpWithEmail(email, password, displayName)
        navigate('/onboarding')
      } else {
        await signInWithEmail(email, password)
        navigate('/home')
      }
    } catch (err) {
      if (['auth/user-not-found','auth/wrong-password','auth/invalid-credential'].includes(err.code))
        setError('Incorrect email or password.')
      else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Switching to sign in...')
        setTimeout(() => { setMode('signin'); setError('') }, 1500)
      }
      else if (err.code === 'auth/weak-password') setError('Password must be at least 6 characters.')
      else setError('Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  const inputStyle = {
    width: '100%', padding: '13px 16px', borderRadius: 10,
    border: '1.5px solid #e5e7eb', background: '#f9fafb', color: '#1a1a1a',
    fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s',
  }

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: 860, borderRadius: 24, overflow: 'hidden', display: 'flex', boxShadow: '0 24px 80px rgba(0,0,0,0.18)', minHeight: 520 }}>
        {/* LEFT */}
        <div style={{ flex: '0 0 42%', background: `linear-gradient(135deg, ${PURPLE} 0%, ${PURPLE_LIGHT} 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: -80, left: -80 }} />
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', bottom: -60, right: -60 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <ShinyText as="h2" style={{ color: 'white', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 14 }}>
              {mode === 'signup' ? 'Welcome back to Podium!' : 'New to Podium?'}
            </ShinyText>
            <ShinyText as="p" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
              {mode === 'signup' ? 'Already have an account? Sign in to continue your streak.' : "Don't have an account yet? Create one in seconds."}
            </ShinyText>
            <button onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError('') }}
              style={{ padding: '11px 36px', borderRadius: 8, background: 'transparent', border: '2px solid rgba(255,255,255,0.7)', color: 'white', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)' }}>
              {mode === 'signup' ? 'SIGN IN' : 'SIGN UP'}
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ flex: 1, background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 44px' }}>
          <ShinyText as="h1" style={{ color: '#1a1a1a', fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 24, textAlign: 'center' }}>
            {mode === 'signup' ? 'Create Account' : 'Sign In'}
          </ShinyText>

          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button onClick={handleGoogle} disabled={loading} title="Continue with Google"
              style={{ width: 44, height: 44, borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: loading ? 'not-allowed' : 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = PURPLE; e.currentTarget.style.boxShadow = `0 0 0 3px ${PURPLE}22` } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ color: '#9ca3af', fontSize: 12 }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 13 }}>
            {mode === 'signup' && (
              <input type="text" placeholder="Name" value={displayName} onChange={e => setDisplayName(e.target.value)} required style={inputStyle}
                onFocus={e => e.target.style.borderColor = PURPLE} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            )}
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle}
              onFocus={e => e.target.style.borderColor = PURPLE} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ ...inputStyle, paddingRight: 42 }}
                onFocus={e => e.target.style.borderColor = PURPLE} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: PURPLE, color: 'white', fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'Inter, sans-serif', transition: 'background 0.15s', marginTop: 4 }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = PURPLE_DARK }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = PURPLE }}>
              {loading ? 'Please wait…' : mode === 'signup' ? 'SIGN UP' : 'SIGN IN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
