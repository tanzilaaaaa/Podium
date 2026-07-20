import { useState } from 'react'
import { CheckCircle, ChevronRight, Zap, Flame } from 'lucide-react'

export default function ResultsView({ prompt, results, onDone }) {
  const { scores, repResult, duration, transcript } = results
  const [showTranscript, setShowTranscript] = useState(false)

  const leveledUp = repResult?.leveledUp
  const xpEarned = repResult?.xpEarned ?? scores.xpEarned
  const newStreak = repResult?.newStreak

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-24">
      <div className="max-w-md mx-auto px-4 pt-8">

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle className="w-6 h-6 text-[#FF6B6B]" />
          <h1 className="text-xl font-bold text-[#1A1A1A]">Rep complete</h1>
        </div>

        {/* XP earned + level up */}
        <div className="bg-[#FF6B6B] rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-lg">+{xpEarned} XP</span>
          </div>
          {leveledUp && (
            <div className="bg-white/20 rounded-xl px-3 py-1">
              <span className="text-white text-sm font-semibold">Level up!</span>
            </div>
          )}
          {newStreak > 0 && !leveledUp && (
            <div className="flex items-center gap-1">
              <span className="text-2xl"><Flame className="w-5 h-5 text-red-400 inline" /></span>
              <span className="text-white font-bold">{newStreak} day streak</span>
            </div>
          )}
        </div>

        {/* Score tiles */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <ScoreTile
            label="Pace"
            value={`${scores.wpm}`}
            unit="wpm"
            score={scores.paceScore}
            detail={getPaceLabel(scores.wpm)}
          />
          <ScoreTile
            label="Filler words"
            value={`${scores.fillerCount}`}
            unit="count"
            score={scores.fillerScore}
            detail={getFillerLabel(scores.fillerCount)}
          />
          <ScoreTile
            label="Clarity"
            value={`${scores.clarityScore}`}
            unit="/ 100"
            score={scores.clarityScore}
            detail="Heuristic proxy"
          />
        </div>

        {/* Overall score */}
        <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#6B7280]">Overall score</p>
            <p className="text-3xl font-bold text-[#1A1A1A]">{scores.totalScore}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#6B7280]">Duration</p>
            <p className="text-lg font-semibold text-[#1A1A1A]">{duration}s</p>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
            Feedback
          </p>
          <div className="space-y-2">
            {scores.feedback.map((line, i) => (
              <p key={i} className="text-sm text-[#1A1A1A] leading-relaxed">
                • {line}
              </p>
            ))}
          </div>
          <p className="text-xs text-[#6B7280] mt-3 pt-3 border-t border-gray-100">
            v1 scoring is a heuristic proxy, not true NLP analysis. It's a starting point, not a verdict.
          </p>
        </div>

        {/* Filler words detail */}
        {scores.fillerWords.length > 0 && (
          <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
              Filler words detected
            </p>
            <div className="flex flex-wrap gap-2">
              {scores.fillerWords.map(({ word, count }) => (
                <span
                  key={word}
                  className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-lg"
                >
                  "{word}" × {count}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Transcript toggle */}
        {transcript && (
          <div className="bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden">
            <button
              onClick={() => setShowTranscript((v) => !v)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-[#1A1A1A]">Your transcript</span>
              <ChevronRight
                className={`w-4 h-4 text-[#6B7280] transition-transform ${showTranscript ? 'rotate-90' : ''}`}
              />
            </button>
            {showTranscript && (
              <div className="px-4 pb-4">
                <p className="text-sm text-[#6B7280] leading-relaxed italic">"{transcript}"</p>
              </div>
            )}
          </div>
        )}

        {/* Done */}
        <button
          onClick={onDone}
          className="w-full py-4 bg-[#1A1A1A] text-white font-semibold rounded-2xl hover:bg-black transition-colors flex items-center justify-center gap-2"
        >
          Back to home
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

function ScoreTile({ label, value, unit, score, detail }) {
  const color = score >= 80 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444'
  const bgColor = score >= 80 ? 'bg-green-50' : score >= 50 ? 'bg-amber-50' : 'bg-red-50'

  return (
    <div className={`${bgColor} rounded-2xl p-3 flex flex-col gap-1`}>
      <p className="text-xs text-[#6B7280] font-medium">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-[#1A1A1A]">{value}</span>
        <span className="text-xs text-[#6B7280]">{unit}</span>
      </div>
      <p className="text-xs" style={{ color }}>{detail}</p>
    </div>
  )
}

function getPaceLabel(wpm) {
  if (wpm < 100) return 'A bit slow'
  if (wpm < 120) return 'Slightly slow'
  if (wpm <= 160) return 'Great pace'
  if (wpm <= 180) return 'Slightly fast'
  return 'Too fast'
}

function getFillerLabel(count) {
  if (count === 0) return 'Clean!'
  if (count <= 2) return 'Solid'
  if (count <= 5) return 'Room to improve'
  return 'Work on this'
}
