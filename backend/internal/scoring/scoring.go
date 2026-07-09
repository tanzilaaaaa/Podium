// Package scoring implements Podium's heuristic rep scoring.
// Ported from the frontend scoring.js — logic is now authoritative server-side.
package scoring

import (
	"math"
	"regexp"
	"strings"

	"github.com/tanzilaaaaa/podium-backend/internal/models"
)

var fillerWords = []string{
	"um", "uh", "like", "you know", "basically", "literally",
	"actually", "right", "okay so", "so yeah", "kind of", "sort of",
	"i mean", "you see",
}

const (
	idealWPMMin = 120
	idealWPMMax = 160
)

type Result struct {
	WPM          int
	FillerCount  int
	FillerWords  []models.FillerWordEntry
	ClarityScore int
	PaceScore    int
	FillerScore  int
	TotalScore   int
	XPEarned     int
	Feedback     []string
}

// ScoreRep scores a transcript against the duration and returns all metrics.
func ScoreRep(transcript string, durationSec int) Result {
	if transcript == "" || durationSec <= 0 {
		return nullScore()
	}

	words := strings.Fields(strings.TrimSpace(transcript))
	wordCount := len(words)
	durationMin := float64(durationSec) / 60.0
	wpm := 0
	if durationMin > 0 {
		wpm = int(math.Round(float64(wordCount) / durationMin))
	}

	// ── Filler words ──────────────────────────────────────────────────────────
	lower := strings.ToLower(transcript)
	fillerCount := 0
	var foundFillers []models.FillerWordEntry

	for _, filler := range fillerWords {
		pattern := `\b` + regexp.QuoteMeta(filler) + `\b`
		re := regexp.MustCompile(`(?i)` + pattern)
		matches := re.FindAllString(lower, -1)
		if len(matches) > 0 {
			fillerCount += len(matches)
			foundFillers = append(foundFillers, models.FillerWordEntry{
				Word:  filler,
				Count: len(matches),
			})
		}
	}

	// ── Pace score ────────────────────────────────────────────────────────────
	var paceScore float64
	if wpm < idealWPMMin {
		paceScore = math.Max(0, 100-float64(idealWPMMin-wpm)*2)
	} else if wpm > idealWPMMax {
		paceScore = math.Max(0, 100-float64(wpm-idealWPMMax)*1.5)
	} else {
		paceScore = 100
	}

	// ── Filler score ─────────────────────────────────────────────────────────
	fillerRatio := 0.0
	if wordCount > 0 {
		fillerRatio = float64(fillerCount) / float64(wordCount)
	}
	fillerScore := math.Max(0, math.Round(100-float64(fillerCount)*8-fillerRatio*100))

	// ── Clarity score ─────────────────────────────────────────────────────────
	clarityScore := 100.0
	sentenceRe := regexp.MustCompile(`[.!?]+`)
	sentences := sentenceRe.Split(transcript, -1)
	var nonEmpty []string
	for _, s := range sentences {
		if strings.TrimSpace(s) != "" {
			nonEmpty = append(nonEmpty, s)
		}
	}

	if len(nonEmpty) > 1 {
		lengths := make([]float64, len(nonEmpty))
		for i, s := range nonEmpty {
			lengths[i] = float64(len(strings.Fields(strings.TrimSpace(s))))
		}
		avg := 0.0
		for _, l := range lengths {
			avg += l
		}
		avg /= float64(len(lengths))

		variance := 0.0
		for _, l := range lengths {
			variance += math.Pow(l-avg, 2)
		}
		variance /= float64(len(lengths))

		clarityScore -= math.Min(50, math.Round(variance*0.5))
	}
	clarityScore -= math.Round(fillerRatio * 80)
	if clarityScore < 0 {
		clarityScore = 0
	}

	// ── Total score ───────────────────────────────────────────────────────────
	totalScore := int(math.Round(paceScore*0.35 + fillerScore*0.4 + clarityScore*0.25))

	// ── XP ────────────────────────────────────────────────────────────────────
	xpEarned := int(math.Round(20 + (float64(totalScore)/100)*80))

	// ── Feedback ──────────────────────────────────────────────────────────────
	feedback := buildFeedback(wpm, fillerCount, int(paceScore), int(fillerScore), int(clarityScore))

	return Result{
		WPM:          wpm,
		FillerCount:  fillerCount,
		FillerWords:  foundFillers,
		ClarityScore: int(clarityScore),
		PaceScore:    int(math.Round(paceScore)),
		FillerScore:  int(fillerScore),
		TotalScore:   totalScore,
		XPEarned:     xpEarned,
		Feedback:     feedback,
	}
}

func buildFeedback(wpm, fillerCount, paceScore, fillerScore, clarityScore int) []string {
	var parts []string

	if paceScore >= 90 {
		parts = append(parts, "Great pace — right in the sweet spot.")
	} else if wpm < idealWPMMin {
		parts = append(parts, "Try picking up the pace a little — aim for 120–160 wpm.")
	} else {
		parts = append(parts, "Slow down slightly to let your ideas land.")
	}

	switch {
	case fillerCount == 0:
		parts = append(parts, "Zero filler words — clean delivery.")
	case fillerCount <= 3:
		parts = append(parts, "Only a couple of filler words — solid.")
	default:
		parts = append(parts, "Try pausing silently instead of filling the gap.")
	}

	if clarityScore >= 80 {
		parts = append(parts, "Your sentences flowed clearly.")
	} else {
		parts = append(parts, "Vary your sentence length — short punchy sentences improve clarity.")
	}

	return parts
}

func nullScore() Result {
	return Result{
		XPEarned: 20,
		Feedback: []string{"Complete the recording to get your score."},
	}
}
