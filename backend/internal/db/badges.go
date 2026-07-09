package db

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tanzilaaaaa/podium-backend/internal/models"
)

// GetAllBadges returns all badge definitions joined with which ones the user has earned.
func GetAllBadges(ctx context.Context, pool *pgxpool.Pool, uid string) ([]models.Badge, error) {
	rows, err := pool.Query(ctx, `
		SELECT b.id, b.name, b.description, b.category,
		       ub.earned_at
		FROM badges b
		LEFT JOIN user_badges ub ON ub.badge_id = b.id AND ub.user_id = $1
		ORDER BY b.category, b.id
	`, uid)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var badges []models.Badge
	for rows.Next() {
		var b models.Badge
		var earnedAt *time.Time
		if err := rows.Scan(&b.ID, &b.Name, &b.Description, &b.Category, &earnedAt); err != nil {
			return nil, err
		}
		if earnedAt != nil {
			s := earnedAt.Format(time.RFC3339)
			b.EarnedAt = &s
		}
		badges = append(badges, b)
	}

	if badges == nil {
		badges = []models.Badge{}
	}
	return badges, rows.Err()
}

// CheckAndAwardBadges evaluates badge criteria and awards any newly earned badges.
// Returns the list of newly awarded badges.
func CheckAndAwardBadges(ctx context.Context, pool *pgxpool.Pool, uid string) ([]models.Badge, error) {
	// Get current user stats
	user, err := GetUser(ctx, pool, uid)
	if err != nil || user == nil {
		return nil, err
	}

	// Count total reps
	var totalReps int
	err = pool.QueryRow(ctx, `SELECT COUNT(*) FROM reps WHERE user_id = $1`, uid).Scan(&totalReps)
	if err != nil {
		return nil, err
	}

	// Get best score
	var bestScore int
	err = pool.QueryRow(ctx, `SELECT COALESCE(MAX(total_score), 0) FROM reps WHERE user_id = $1`, uid).Scan(&bestScore)
	if err != nil {
		return nil, err
	}

	// Check for perfect pace score
	var hasPerfectPace bool
	err = pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM reps WHERE user_id = $1 AND pace_score = 100)`, uid).Scan(&hasPerfectPace)
	if err != nil {
		return nil, err
	}

	// Check for zero-filler rep
	var hasNoFillers bool
	err = pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM reps WHERE user_id = $1 AND filler_count = 0)`, uid).Scan(&hasNoFillers)
	if err != nil {
		return nil, err
	}

	// Determine which badges should be earned
	shouldEarn := map[string]bool{}

	if user.StreakCount >= 3  { shouldEarn["streak_3"] = true }
	if user.StreakCount >= 7  { shouldEarn["streak_7"] = true }
	if user.StreakCount >= 14 { shouldEarn["streak_14"] = true }
	if user.StreakCount >= 30 { shouldEarn["streak_30"] = true }

	if totalReps >= 1  { shouldEarn["reps_1"] = true }
	if totalReps >= 10 { shouldEarn["reps_10"] = true }
	if totalReps >= 25 { shouldEarn["reps_25"] = true }
	if totalReps >= 50 { shouldEarn["reps_50"] = true }

	if bestScore >= 80 { shouldEarn["score_80"] = true }
	if bestScore >= 90 { shouldEarn["score_90"] = true }
	if hasNoFillers    { shouldEarn["no_fillers"] = true }
	if hasPerfectPace  { shouldEarn["pace_ace"] = true }

	if user.XP >= 100  { shouldEarn["xp_100"] = true }
	if user.XP >= 500  { shouldEarn["xp_500"] = true }
	if user.XP >= 1000 { shouldEarn["xp_1000"] = true }
	if user.XP >= 3000 { shouldEarn["xp_3000"] = true }

	// Get already-earned badge IDs
	rows, err := pool.Query(ctx, `SELECT badge_id FROM user_badges WHERE user_id = $1`, uid)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	alreadyEarned := map[string]bool{}
	for rows.Next() {
		var bid string
		if err := rows.Scan(&bid); err != nil {
			return nil, err
		}
		alreadyEarned[bid] = true
	}

	// Award new badges
	var newBadges []models.Badge
	for badgeID := range shouldEarn {
		if alreadyEarned[badgeID] {
			continue
		}
		_, err := pool.Exec(ctx, `
			INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2)
			ON CONFLICT DO NOTHING
		`, uid, badgeID)
		if err != nil {
			continue // don't fail the whole request for a badge
		}

		// Fetch badge details
		var b models.Badge
		err = pool.QueryRow(ctx, `SELECT id, name, description, category FROM badges WHERE id = $1`, badgeID).
			Scan(&b.ID, &b.Name, &b.Description, &b.Category)
		if err == nil {
			newBadges = append(newBadges, b)
		}
	}

	if newBadges == nil {
		newBadges = []models.Badge{}
	}
	return newBadges, nil
}
