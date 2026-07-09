/**
 * Podium scoring engine — heuristic-based, v1
 * Be explicit in UI that this is a proxy score, not true NLP analysis.
 */

const FILLER_WORDS = [
  'um', 'uh', 'like', 'you know', 'basically', 'literally',
  'actually', 'right', 'okay so', 'so yeah', 'kind of', 'sort of',
  'i mean', 'you see',
]

const IDEAL_WPM_MIN = 120
const IDEAL_WPM_MAX = 160

/**
 * Main scoring function.
 * @param {string} transcript - raw transcript text
 * @param {number} durationSec - recording duration in seconds
 * @returns {{ wpm, fillerCount, fillerWords, clarityScore, totalScore, xpEarned, feedback }}
 */
export function scoreRep(transcript, durationSec) {
  if (!transcript || durationSec <= 0) {
    return nullScore()
  }

  const words = transcript.trim().split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const durationMin = durationSec / 60
  const wpm = Math.round(wordCount / durationMin)

  // ── Filler word count ──────────────────────────────────────────────────────
  const lowerTranscript = transcript.toLowerCase()
  let fillerCount = 0
  const foundFillers = []

  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi')
    const matches = lowerTranscript.match(regex)
    if (matches) {
      fillerCount += matches.length
      foundFillers.push({ word: filler, count: matches.length })
    }
  }

  // ── Pace score (0–100) ────────────────────────────────────────────────────
  let paceScore
  if (wpm < IDEAL_WPM_MIN) {
    paceScore = Math.max(0, 100 - (IDEAL_WPM_MIN - wpm) * 2)
  } else if (wpm > IDEAL_WPM_MAX) {
    paceScore = Math.max(0, 100 - (wpm - IDEAL_WPM_MAX) * 1.5)
  } else {
    paceScore = 100
  }

  // ── Filler score (0–100) ──────────────────────────────────────────────────
  // 0 fillers = 100, each filler deducts ~8 points, floor at 0
  const fillerRatio = wordCount > 0 ? fillerCount / wordCount : 0
  const fillerScore = Math.max(0, Math.round(100 - fillerCount * 8 - fillerRatio * 100))

  // ── Clarity score (0–100) ─────────────────────────────────────────────────
  // Proxy: sentence length variance + filler ratio
  // Lower variance + fewer fillers = clearer delivery
  const sentences = transcript.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  let clarityScore = 100

  if (sentences.length > 1) {
    const sentenceLengths = sentences.map((s) => s.trim().split(/\s+/).length)
    const avgLen = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
    const variance =
      sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLen, 2), 0) /
      sentenceLengths.length
    // High variance = less clarity. Cap penalty at 50 points.
    clarityScore -= Math.min(50, Math.round(variance * 0.5))
  }

  // Filler ratio also hurts clarity
  clarityScore -= Math.round(fillerRatio * 80)
  clarityScore = Math.max(0, Math.round(clarityScore))

  // ── Total score ───────────────────────────────────────────────────────────
  const totalScore = Math.round(paceScore * 0.35 + fillerScore * 0.4 + clarityScore * 0.25)

  // ── XP earned ─────────────────────────────────────────────────────────────
  // Base 20 XP for completing, scaled up to 80 by score quality
  const xpEarned = Math.round(20 + (totalScore / 100) * 80)

  // ── Human-readable feedback ───────────────────────────────────────────────
  const feedback = buildFeedback({ wpm, fillerCount, fillerScore, paceScore, clarityScore })

  return {
    wpm,
    fillerCount,
    fillerWords: foundFillers,
    paceScore: Math.round(paceScore),
    fillerScore,
    clarityScore,
    totalScore,
    xpEarned,
    feedback,
  }
}

function buildFeedback({ wpm, fillerCount, paceScore, fillerScore, clarityScore }) {
  const parts = []

  // Pace
  if (paceScore >= 90) {
    parts.push(`Great pace at ${wpm} wpm — right in the sweet spot.`)
  } else if (wpm < IDEAL_WPM_MIN) {
    parts.push(`You spoke at ${wpm} wpm — try picking up the pace a little (aim for 120–160 wpm).`)
  } else {
    parts.push(`You spoke at ${wpm} wpm — slow down slightly to let ideas land.`)
  }

  // Fillers
  if (fillerCount === 0) {
    parts.push('Zero filler words — clean delivery!')
  } else if (fillerCount <= 3) {
    parts.push(`${fillerCount} filler word${fillerCount > 1 ? 's' : ''} — that's pretty solid.`)
  } else {
    parts.push(`${fillerCount} filler words — try pausing silently instead of filling the gap.`)
  }

  // Clarity
  if (clarityScore >= 80) {
    parts.push('Your sentences flowed clearly.')
  } else {
    parts.push('Try varying your sentence length — short punchy sentences improve clarity.')
  }

  return parts
}

function nullScore() {
  return {
    wpm: 0,
    fillerCount: 0,
    fillerWords: [],
    paceScore: 0,
    fillerScore: 0,
    clarityScore: 0,
    totalScore: 0,
    xpEarned: 20, // still reward for showing up
    feedback: ['Complete the recording to get your score.'],
  }
}
