package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/tanzilaaaaa/podium-backend/internal/db"
	"github.com/tanzilaaaaa/podium-backend/internal/handlers"
	"github.com/tanzilaaaaa/podium-backend/internal/middleware"
)

func main() {
	// Load .env (ignore error in production where env vars are set externally)
	_ = godotenv.Load()

	// Connect to Postgres
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := db.Connect(ctx)
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer pool.Close()
	log.Println("connected to postgres")

	// Set Gin mode
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.DebugMode)
	}

	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// CORS
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	r.Use(corsMiddleware(allowedOrigins))

	// Health check (no auth)
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "podium-backend"})
	})

	// ── API v1 ────────────────────────────────────────────────────────────────
	v1 := r.Group("/api/v1")
	v1.Use(middleware.AuthMiddleware())
	{
		// Auth sync — call once after Firebase login/signup
		v1.POST("/auth/sync", handlers.SyncUser(pool))

		// User profile
		v1.GET("/users/me", handlers.GetMe(pool))
		v1.PATCH("/users/me", handlers.UpdateMe(pool))

		// Reps — submit a recording, get history
		v1.POST("/reps", handlers.SubmitRep(pool))
		v1.GET("/reps", handlers.GetReps(pool))

		// Badges
		v1.GET("/badges", handlers.GetBadges(pool))
	}

	// Admin / dev routes — no auth, remove before real production
	admin := r.Group("/api/v1/admin")
	{
		admin.POST("/seed", handlers.SeedPrompts(pool))
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("podium backend listening on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("server error: %v", err)
	}
}

func corsMiddleware(allowedOrigins string) gin.HandlerFunc {
	origins := map[string]bool{}
	for _, o := range strings.Split(allowedOrigins, ",") {
		o = strings.TrimSpace(o)
		if o != "" {
			origins[o] = true
		}
	}
	if len(origins) == 0 {
		origins["http://localhost:5173"] = true
	}

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origins[origin] || origins["*"] {
			c.Header("Access-Control-Allow-Origin", origin)
		}
		c.Header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Authorization,Content-Type")
		c.Header("Access-Control-Max-Age", "86400")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}
