package models

import "time"

// ─── User ────────────────────────────────────────────────────────────────────

type User struct {
	ID             string    `json:"id"`
	Email          string    `json:"email"`
	DisplayName    string    `json:"displayName"`
	XP             int       `json:"xp"`
	Level          int       `json:"level"`
	StreakCount    int       `json:"streakCount"`
	LastRepDate    *string   `json:"lastRepDate"` // "YYYY-MM-DD" or nil
	StreakFreezes  int       `json:"streakFreezesAvailable"`
	OnboardingDone bool      `json:"onboardingDone"`
	Goals          []string  `json:"goals"`
	CreatedAt      time.Time `json:"createdAt"`
}

type UpdateProfileRequest struct {
	DisplayName    *string  `json:"displayName"`
	Goals          []string `json:"goals"`
	OnboardingDone *bool    `json:"onboardingDone"`
}

// ─── Rep ─────────────────────────────────────────────────────────────────────

type FillerWordEntry struct {
	Word  string `json:"word"`
	Count int    `json:"count"`
}

type Rep struct {
	ID           int64             `json:"id"`
	UserID       string            `json:"userId"`
	PromptID     string            `json:"promptId"`
	PromptText   string            `json:"promptText"`
	Category     string            `json:"category"`
	DurationSec  int               `json:"audioDurationSec"`
	Transcript   string            `json:"transcript"`
	WPM          int               `json:"wpm"`
	FillerCount  int               `json:"fillerCount"`
	FillerWords  []FillerWordEntry `json:"fillerWords"`
	ClarityScore int               `json:"clarityScore"`
	PaceScore    int               `json:"paceScore"`
	FillerScore  int               `json:"fillerScore"`
	TotalScore   int               `json:"totalScore"`
	XPEarned     int               `json:"xpEarned"`
	Feedback     []string          `json:"feedback"`
	CreatedAt    time.Time         `json:"createdAt"`
}

type SubmitRepRequest struct {
	PromptID    string `json:"promptId"`
	PromptText  string `json:"promptText"  binding:"required"`
	Category    string `json:"category"`
	DurationSec int    `json:"audioDurationSec" binding:"required,min=5"`
	Transcript  string `json:"transcript"`
}

type SubmitRepResponse struct {
	Rep         Rep    `json:"rep"`
	NewXP       int    `json:"newXp"`
	NewLevel    int    `json:"newLevel"`
	NewStreak   int    `json:"newStreak"`
	LeveledUp   bool   `json:"leveledUp"`
	XPEarned    int    `json:"xpEarned"`
	NewBadges   []Badge `json:"newBadges"`
}

// ─── Badge ───────────────────────────────────────────────────────────────────

type Badge struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Category    string  `json:"category"`
	EarnedAt    *string `json:"earnedAt,omitempty"`
}
