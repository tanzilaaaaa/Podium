package db

import (
	"context"
	"encoding/json"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tanzilaaaaa/podium-backend/internal/models"
	"github.com/tanzilaaaaa/podium-backend/internal/scoring"
)

// SaveRep scores the transcript server-side and persists the rep.
func SaveRep(ctx context.Context, pool *pgxpool.Pool, uid string, req models.SubmitRepRequest) (*models.Rep, error) {
	scores := scoring.ScoreRep(req.Transcript, req.DurationSec)

	fillerJSON, err := json.Marshal(scores.FillerWords)
	if err != nil {
		return nil, err
	}

	var rep models.Rep
	var createdAt time.Time
	var fillerRaw []byte
	var feedback []string

	err = pool.QueryRow(ctx, `
		INSERT INTO reps (
			user_id, prompt_id, prompt_text, category, duration_sec, transcript,
			wpm, filler_count, filler_words, clarity_score, pace_score,
			filler_score, total_score, xp_earned, feedback
		) VALUES (
			$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
		)
		RETURNING id, user_id, prompt_id, prompt_text, category, duration_sec,
		          transcript, wpm, filler_count, filler_words, clarity_score,
		          pace_score, filler_score, total_score, xp_earned, feedback, created_at
	`,
		uid,
		req.PromptID,
		req.PromptText,
		req.Category,
		req.DurationSec,
		req.Transcript,
		scores.WPM,
		scores.FillerCount,
		fillerJSON,
		scores.ClarityScore,
		scores.PaceScore,
		scores.FillerScore,
		scores.TotalScore,
		scores.XPEarned,
		scores.Feedback,
	).Scan(
		&rep.ID, &rep.UserID, &rep.PromptID, &rep.PromptText,
		&rep.Category, &rep.DurationSec, &rep.Transcript,
		&rep.WPM, &rep.FillerCount, &fillerRaw,
		&rep.ClarityScore, &rep.PaceScore, &rep.FillerScore,
		&rep.TotalScore, &rep.XPEarned, &feedback, &createdAt,
	)
	if err != nil {
		return nil, err
	}

	rep.CreatedAt = createdAt
	rep.Feedback = feedback
	if err := json.Unmarshal(fillerRaw, &rep.FillerWords); err != nil {
		rep.FillerWords = []models.FillerWordEntry{}
	}

	return &rep, nil
}

// GetReps returns the most recent N reps for a user.
func GetReps(ctx context.Context, pool *pgxpool.Pool, uid string, limit int) ([]models.Rep, error) {
	if limit <= 0 || limit > 100 {
		limit = 30
	}

	rows, err := pool.Query(ctx, `
		SELECT id, user_id, prompt_id, prompt_text, category, duration_sec,
		       transcript, wpm, filler_count, filler_words, clarity_score,
		       pace_score, filler_score, total_score, xp_earned, feedback, created_at
		FROM reps
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2
	`, uid, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reps []models.Rep
	for rows.Next() {
		var rep models.Rep
		var fillerRaw []byte
		var feedback []string
		var createdAt time.Time

		if err := rows.Scan(
			&rep.ID, &rep.UserID, &rep.PromptID, &rep.PromptText,
			&rep.Category, &rep.DurationSec, &rep.Transcript,
			&rep.WPM, &rep.FillerCount, &fillerRaw,
			&rep.ClarityScore, &rep.PaceScore, &rep.FillerScore,
			&rep.TotalScore, &rep.XPEarned, &feedback, &createdAt,
		); err != nil {
			return nil, err
		}

		rep.CreatedAt = createdAt
		rep.Feedback = feedback
		if err := json.Unmarshal(fillerRaw, &rep.FillerWords); err != nil {
			rep.FillerWords = []models.FillerWordEntry{}
		}
		reps = append(reps, rep)
	}

	if reps == nil {
		reps = []models.Rep{}
	}
	return reps, rows.Err()
}
