package db

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tanzilaaaaa/podium-backend/internal/models"
)

// GetUser fetches a user by Firebase UID.
func GetUser(ctx context.Context, pool *pgxpool.Pool, uid string) (*models.User, error) {
	row := pool.QueryRow(ctx, `
		SELECT id, email, display_name, xp, level, streak_count,
		       last_rep_date, streak_freezes, onboarding_done, goals, created_at
		FROM users WHERE id = $1
	`, uid)

	return scanUser(row)
}

// UpsertUser creates or updates a user record (called after Firebase auth).
func UpsertUser(ctx context.Context, pool *pgxpool.Pool, uid, email, displayName string) (*models.User, error) {
	row := pool.QueryRow(ctx, `
		INSERT INTO users (id, email, display_name)
		VALUES ($1, $2, $3)
		ON CONFLICT (id) DO UPDATE
		  SET email        = EXCLUDED.email,
		      display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), users.display_name)
		RETURNING id, email, display_name, xp, level, streak_count,
		          last_rep_date, streak_freezes, onboarding_done, goals, created_at
	`, uid, email, displayName)

	return scanUser(row)
}

// UpdateProfile applies partial updates to a user profile.
func UpdateProfile(ctx context.Context, pool *pgxpool.Pool, uid string, req models.UpdateProfileRequest) (*models.User, error) {
	setClauses := []string{}
	args := []any{}
	argIdx := 1

	if req.DisplayName != nil {
		setClauses = append(setClauses, fmt.Sprintf("display_name = $%d", argIdx))
		args = append(args, *req.DisplayName)
		argIdx++
	}
	if req.Goals != nil {
		setClauses = append(setClauses, fmt.Sprintf("goals = $%d", argIdx))
		args = append(args, req.Goals)
		argIdx++
	}
	if req.OnboardingDone != nil {
		setClauses = append(setClauses, fmt.Sprintf("onboarding_done = $%d", argIdx))
		args = append(args, *req.OnboardingDone)
		argIdx++
	}

	if len(setClauses) == 0 {
		return GetUser(ctx, pool, uid)
	}

	args = append(args, uid)
	query := fmt.Sprintf(`
		UPDATE users SET %s WHERE id = $%d
		RETURNING id, email, display_name, xp, level, streak_count,
		          last_rep_date, streak_freezes, onboarding_done, goals, created_at
	`, strings.Join(setClauses, ", "), argIdx)

	row := pool.QueryRow(ctx, query, args...)
	return scanUser(row)
}

// ProcessRepCompletion updates XP, level, and streak after a rep is saved.
// Returns updated profile fields and whether the user leveled up.
func ProcessRepCompletion(ctx context.Context, pool *pgxpool.Pool, uid string, xpEarned int) (newXP, newLevel, newStreak int, leveledUp bool, err error) {
	tx, err := pool.Begin(ctx)
	if err != nil {
		return 0, 0, 0, false, err
	}
	defer tx.Rollback(ctx)

	// Lock the row
	var currentXP, currentLevel, currentStreak, currentFreezes int
	var lastRepDate *time.Time

	err = tx.QueryRow(ctx, `
		SELECT xp, level, streak_count, last_rep_date, streak_freezes
		FROM users WHERE id = $1 FOR UPDATE
	`, uid).Scan(&currentXP, &currentLevel, &currentStreak, &lastRepDate, &currentFreezes)
	if err != nil {
		return 0, 0, 0, false, err
	}

	today := time.Now().UTC().Truncate(24 * time.Hour)
	todayStr := today.Format("2006-01-02")

	// Already did a rep today — no double XP
	if lastRepDate != nil && lastRepDate.Format("2006-01-02") == todayStr {
		return currentXP, currentLevel, currentStreak, false, nil
	}

	// Streak logic
	yesterday := today.AddDate(0, 0, -1)
	newStreak = currentStreak
	usedFreeze := false

	if lastRepDate == nil {
		newStreak = 1
	} else if lastRepDate.Format("2006-01-02") == yesterday.Format("2006-01-02") {
		newStreak = currentStreak + 1
	} else {
		// Missed a day
		if currentFreezes > 0 && currentStreak > 0 {
			newStreak = currentStreak // freeze saves it
			usedFreeze = true
		} else {
			newStreak = 1
		}
	}

	newXP = currentXP + xpEarned
	newLevel = calculateLevel(newXP)
	leveledUp = newLevel > currentLevel

	freezeUpdate := ""
	if usedFreeze {
		freezeUpdate = ", streak_freezes = streak_freezes - 1"
	}

	_, err = tx.Exec(ctx, fmt.Sprintf(`
		UPDATE users
		SET xp = $1, level = $2, streak_count = $3, last_rep_date = $4 %s
		WHERE id = $5
	`, freezeUpdate), newXP, newLevel, newStreak, todayStr, uid)
	if err != nil {
		return 0, 0, 0, false, err
	}

	return newXP, newLevel, newStreak, leveledUp, tx.Commit(ctx)
}

// ─── Level helpers ────────────────────────────────────────────────────────────

var levelThresholds = []struct {
	level int
	minXP int
}{
	{1, 0}, {2, 100}, {3, 300}, {4, 600}, {5, 1000},
	{6, 1500}, {7, 2200}, {8, 3000},
}

func calculateLevel(xp int) int {
	level := 1
	for _, t := range levelThresholds {
		if xp >= t.minXP {
			level = t.level
		}
	}
	return level
}

// ─── Scanner ──────────────────────────────────────────────────────────────────

func scanUser(row pgx.Row) (*models.User, error) {
	u := &models.User{}
	var lastRepDate *time.Time
	var goals []string

	err := row.Scan(
		&u.ID, &u.Email, &u.DisplayName, &u.XP, &u.Level,
		&u.StreakCount, &lastRepDate, &u.StreakFreezes,
		&u.OnboardingDone, &goals, &u.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if lastRepDate != nil {
		s := lastRepDate.Format("2006-01-02")
		u.LastRepDate = &s
	}
	u.Goals = goals
	if u.Goals == nil {
		u.Goals = []string{}
	}
	return u, nil
}
