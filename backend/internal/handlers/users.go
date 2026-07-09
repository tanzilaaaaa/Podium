package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tanzilaaaaa/podium-backend/internal/db"
	"github.com/tanzilaaaaa/podium-backend/internal/middleware"
	"github.com/tanzilaaaaa/podium-backend/internal/models"
)

// POST /api/v1/auth/sync
// Called by the frontend after Firebase login. Creates the user if new, returns profile.
func SyncUser(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := middleware.UID(c)
		email := middleware.Email(c)

		var body struct {
			DisplayName string `json:"displayName"`
		}
		// Ignore bind error — displayName is optional
		_ = c.ShouldBindJSON(&body)

		user, err := db.UpsertUser(c.Request.Context(), pool, uid, email, body.DisplayName)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to sync user"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}

// GET /api/v1/users/me
func GetMe(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := middleware.UID(c)

		user, err := db.GetUser(c.Request.Context(), pool, uid)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
			return
		}
		if user == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found — call /auth/sync first"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}

// PATCH /api/v1/users/me
func UpdateMe(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := middleware.UID(c)

		var req models.UpdateProfileRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		user, err := db.UpdateProfile(c.Request.Context(), pool, uid, req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}
