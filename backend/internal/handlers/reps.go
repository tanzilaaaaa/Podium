package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tanzilaaaaa/podium-backend/internal/db"
	"github.com/tanzilaaaaa/podium-backend/internal/middleware"
	"github.com/tanzilaaaaa/podium-backend/internal/models"
)

// POST /api/v1/reps
// Accepts a transcript + duration, scores server-side, saves, updates XP/streak, checks badges.
func SubmitRep(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := middleware.UID(c)

		var req models.SubmitRepRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		ctx := c.Request.Context()

		// 1. Score + save the rep
		rep, err := db.SaveRep(ctx, pool, uid, req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save rep"})
			return
		}

		// 2. Update XP, level, streak
		newXP, newLevel, newStreak, leveledUp, streakLost, usedFreeze, err := db.ProcessRepCompletion(ctx, pool, uid, rep.XPEarned)
		if err != nil {
			c.JSON(http.StatusOK, models.SubmitRepResponse{
				Rep: *rep, XPEarned: rep.XPEarned,
			})
			return
		}

		// 3. Check & award badges
		newBadges, _ := db.CheckAndAwardBadges(ctx, pool, uid)

		c.JSON(http.StatusCreated, models.SubmitRepResponse{
			Rep:        *rep,
			NewXP:      newXP,
			NewLevel:   newLevel,
			NewStreak:  newStreak,
			LeveledUp:  leveledUp,
			StreakLost: streakLost,
			UsedFreeze: usedFreeze,
			XPEarned:   rep.XPEarned,
			NewBadges:  newBadges,
		})
	}
}

// GET /api/v1/reps?limit=30
func GetReps(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := middleware.UID(c)

		limit := 30
		if l := c.Query("limit"); l != "" {
			if n, err := strconv.Atoi(l); err == nil && n > 0 && n <= 100 {
				limit = n
			}
		}

		reps, err := db.GetReps(c.Request.Context(), pool, uid, limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch reps"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"reps": reps, "count": len(reps)})
	}
}
