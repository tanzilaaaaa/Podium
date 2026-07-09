package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tanzilaaaaa/podium-backend/internal/db"
	"github.com/tanzilaaaaa/podium-backend/internal/middleware"
)

// GET /api/v1/badges
// Returns all badges with earned status for the authenticated user.
func GetBadges(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := middleware.UID(c)

		badges, err := db.GetAllBadges(c.Request.Context(), pool, uid)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch badges"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"badges": badges})
	}
}
