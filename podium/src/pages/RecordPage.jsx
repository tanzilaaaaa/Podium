import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, Mic, Square } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { submitRep } from '../lib/api'
import { MicDeniedScreen, UnsupportedScreen, ShortRecordingBanner } from '../components/EdgeCaseScreens'

const BG = '#0d0d1a'
const TEXT_SEC = 'rgba(255,255,255,0.55)'
const MAX_DURATION = 60

export default function RecordPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const prompt = state?.prompt

  const [phase, setPhase] = useState('pre')
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState('')
  const [micDenied, setMicDenied] = useState(false)
  const [sttUnsupported, setSttUnsupported] = useState(false)
  const [showShortWarning, setShowShortWarning] = useState(false)

  const mediaRecorderRef = useRef(null)
  const recognitionRef = useRef(null)
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  const finalTranscriptRef = useRef('')

  useEffect(() => {
    if (!prompt) navigate('/home')
  }, [prompt, navigate])

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      stopRecognition()
    }
  }, [])

  function stopRecognition() {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
  }

  async function startRecording() {
    setError('')
    setShowShortWarning(false)
    setMicDenied(false)
    finalTranscriptRef.current = ''

    // Check for getUserMedia support
    if (!navigator.mediaDevices?.getUserMedia) {
      setSttUnsupported(true)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      recorder.start()
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicDenied(true)
      } else {
        setError('Could not access microphone. Please check your device settings.')
      }
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = false
      recognition.lang = 'en-US'
      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += event.results[i][0].transcript + ' '
          }
        }
      }
      recognition.onerror = (e) => {
        if (e.error !== 'aborted') console.warn('STT error:', e.error)
      }
      recognition.start()
      recognitionRef.current = recognition
    } else {
      setSttUnsupported(true)
      // Proceed without transcription — scoring will use null score fallback
    }

    startTimeRef.current = Date.now()
    setElapsed(0)
    timerRef.current = setInterval(() => {
      const secs = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setElapsed(secs)
      if (secs >= MAX_DURATION) stopRecording()
    }, 250)

    setPhase('recording')
  }

  async function stopRecording() {
    clearInterval(timerRef.current)
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop())
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
    stopRecognition()

    if (duration < 5) {
      setError('Recording too short — speak for at least 5 seconds.')
      setShowShortWarning(true)
      setPhase('pre')
      setElapsed(0)
      return
    }

    setPhase('processing')

    const finalText = finalTranscriptRef.current.trim()

    let repResult = null
    let scores = null

    try {
      // Submit to Go backend — scoring happens server-side
      const response = await submitRep({
        promptId:        prompt.id || '',
        promptText:      prompt.text,
        category:        prompt.category,
        audioDurationSec: duration,
        transcript:      finalText,
      })

      // response shape: { rep, newXp, newLevel, newStreak, leveledUp, xpEarned, newBadges }
      scores = response.rep
      repResult = {
        newXP:     response.newXp,
        newLevel:  response.newLevel,
        newStreak: response.newStreak,
        leveledUp: response.leveledUp,
        xpEarned:  response.xpEarned,
        newBadges: response.newBadges,
      }

      // Refresh profile in context (XP, streak, level all updated server-side)
      await refreshProfile()
    } catch (err) {
      console.error('Failed to submit rep:', err)
      // Still navigate to results if we have a response, otherwise show error
      setPhase('pre')
      setError('Failed to save your rep. Check your connection and try again.')
      return
    }

    navigate('/results', {
      state: { scores, repResult, duration, transcript: finalText, prompt },
    })
  }

  const remaining = Math.max(0, MAX_DURATION - elapsed)

  // Full-screen edge case states
  if (micDenied) {
    return (
      <MicDeniedScreen
        onRetry={() => { setMicDenied(false); startRecording() }}
        onGoBack={() => navigate('/home')}
      />
    )
  }

  if (sttUnsupported && phase === 'pre') {
    // Safari / unsupported — show warning but still allow recording (just no transcript)
    // Only block if MediaRecorder itself is missing
    const hasMediaRecorder = typeof MediaRecorder !== 'undefined'
    const hasGetUserMedia = !!navigator.mediaDevices?.getUserMedia
    if (!hasMediaRecorder || !hasGetUserMedia) {
      return <UnsupportedScreen missing={['mic']} onGoBack={() => navigate('/home')} />
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          maxWidth: 430,
          margin: '0 auto',
          width: '100%',
          padding: '0 20px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingTop: 52,
            marginBottom: 28,
          }}
        >
          <button
            onClick={() => navigate('/home')}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.06)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <span
            style={{
              color: TEXT_SEC,
              fontSize: 14,
              fontWeight: 500,
              marginLeft: 14,
            }}
          >
            {phase === 'processing' ? 'Scoring your rep…' : phase === 'recording' ? 'Recording' : 'Ready'}
          </span>
        </div>

        {/* Prompt */}
        <div
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 18,
            padding: '18px 20px',
            marginBottom: 32,
          }}
        >
          <p
            style={{
              color: '#a78bfa',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: '0 0 8px',
              textTransform: 'capitalize',
            }}
          >
            {prompt?.category}
          </p>
          <p
            style={{
              color: 'white',
              fontSize: 17,
              fontWeight: 600,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {prompt?.text}
          </p>
        </div>

        {/* Main content area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 32,
          }}
        >
          {phase === 'processing' ? (
            /* Processing state */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  border: '3px solid #6644ee',
                  borderTopColor: 'transparent',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <p style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: 0 }}>
                Scoring your rep…
              </p>
              <p style={{ color: TEXT_SEC, fontSize: 14, margin: 0 }}>Just a moment</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : phase === 'recording' ? (
            /* Recording state */
            <>
              {/* Pulse animation */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <style>{`
                  @keyframes pulse-ring {
                    0% { transform: scale(0.85); opacity: 0.7; }
                    100% { transform: scale(1.6); opacity: 0; }
                  }
                  @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
                <div
                  style={{
                    position: 'absolute',
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    background: 'rgba(102,68,238,0.25)',
                    animation: 'pulse-ring 1.4s ease-out infinite',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    background: 'rgba(102,68,238,0.15)',
                    animation: 'pulse-ring 1.4s ease-out 0.4s infinite',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    background: 'rgba(102,68,238,0.08)',
                    animation: 'pulse-ring 1.4s ease-out 0.8s infinite',
                  }}
                />
                <div
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4422cc, #7744ff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <Mic size={28} color="white" />
                </div>
              </div>

              {/* Countdown */}
              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    color: 'white',
                    fontSize: 64,
                    fontWeight: 800,
                    margin: 0,
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {remaining}
                </p>
                <p style={{ color: TEXT_SEC, fontSize: 14, margin: '4px 0 0' }}>seconds left</p>
              </div>

              {/* Stop button */}
              <button
                onClick={stopRecording}
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  border: 'none',
                  background: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 0 0 6px rgba(239,68,68,0.2)',
                }}
              >
                <Square size={24} color="white" fill="white" />
              </button>
            </>
          ) : (
            /* Pre-recording state */
            <>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: TEXT_SEC, fontSize: 15, margin: '0 0 4px' }}>
                  Tap to begin
                </p>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, margin: 0 }}>
                  Up to 60 seconds
                </p>
              </div>

              <button
                onClick={startRecording}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4422cc, #7744ff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(68,34,204,0.45)',
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Mic size={36} color="white" />
              </button>

              {showShortWarning && (
                <ShortRecordingBanner minSeconds={5} onDismiss={() => setShowShortWarning(false)} />
              )}

              {error && !showShortWarning && (
                <div
                  style={{
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    color: '#ef4444',
                    fontSize: 13,
                    textAlign: 'center',
                    maxWidth: 300,
                  }}
                >
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
