// Package middleware provides Gin middleware for Firebase JWT verification.
// Firebase ID tokens are RS256-signed JWTs verified against Google's public keys.
package middleware

import (
	"context"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

const firebaseKeyURL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"

var keyCache struct {
	sync.RWMutex
	keys    map[string]*rsa.PublicKey
	expires time.Time
}

// AuthMiddleware validates Firebase ID tokens.
// Sets "uid" and "email" in the Gin context.
func AuthMiddleware() gin.HandlerFunc {
	projectID := os.Getenv("FIREBASE_PROJECT_ID")

	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing Authorization header"})
			return
		}
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		uid, email, err := verifyFirebaseToken(context.Background(), tokenStr, projectID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		c.Set("uid", uid)
		c.Set("email", email)
		c.Next()
	}
}

// UID extracts the Firebase UID set by AuthMiddleware.
func UID(c *gin.Context) string {
	v, _ := c.Get("uid")
	s, _ := v.(string)
	return s
}

// Email extracts the email set by AuthMiddleware.
func Email(c *gin.Context) string {
	v, _ := c.Get("email")
	s, _ := v.(string)
	return s
}

func verifyFirebaseToken(_ context.Context, tokenStr, projectID string) (uid, email string, err error) {
	// Peek at the header to get the key ID without full verification
	parts := strings.Split(tokenStr, ".")
	if len(parts) != 3 {
		return "", "", fmt.Errorf("malformed token")
	}
	headerBytes, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return "", "", fmt.Errorf("bad header encoding")
	}
	var header struct {
		Kid string `json:"kid"`
		Alg string `json:"alg"`
	}
	if err := json.Unmarshal(headerBytes, &header); err != nil || header.Kid == "" {
		return "", "", fmt.Errorf("missing kid in header")
	}

	pubKey, err := getPublicKey(header.Kid)
	if err != nil {
		return "", "", err
	}

	token, err := jwt.Parse(tokenStr,
		func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return pubKey, nil
		},
		jwt.WithAudience(projectID),
		jwt.WithIssuer("https://securetoken.google.com/"+projectID),
		jwt.WithExpirationRequired(),
	)
	if err != nil || !token.Valid {
		return "", "", fmt.Errorf("token validation failed: %w", err)
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", "", fmt.Errorf("invalid claims")
	}

	uid, _ = claims["user_id"].(string)
	if uid == "" {
		uid, _ = claims["sub"].(string)
	}
	email, _ = claims["email"].(string)

	if uid == "" {
		return "", "", fmt.Errorf("token missing uid")
	}
	return uid, email, nil
}

func getPublicKey(kid string) (*rsa.PublicKey, error) {
	keyCache.RLock()
	if time.Now().Before(keyCache.expires) {
		if k, ok := keyCache.keys[kid]; ok {
			keyCache.RUnlock()
			return k, nil
		}
	}
	keyCache.RUnlock()

	keyCache.Lock()
	defer keyCache.Unlock()

	resp, err := http.Get(firebaseKeyURL)
	if err != nil {
		return nil, fmt.Errorf("fetching firebase keys: %w", err)
	}
	defer resp.Body.Close()

	// Response is a map of kid → PEM-encoded x509 certificate
	var certMap map[string]string
	if err := json.NewDecoder(resp.Body).Decode(&certMap); err != nil {
		return nil, fmt.Errorf("decoding firebase keys: %w", err)
	}

	keys := map[string]*rsa.PublicKey{}
	for keyID, certPEM := range certMap {
		block, _ := pem.Decode([]byte(certPEM))
		if block == nil {
			continue
		}
		cert, err := x509.ParseCertificate(block.Bytes)
		if err != nil {
			continue
		}
		rsaKey, ok := cert.PublicKey.(*rsa.PublicKey)
		if !ok {
			continue
		}
		keys[keyID] = rsaKey
	}

	keyCache.keys = keys
	keyCache.expires = time.Now().Add(1 * time.Hour)

	if k, ok := keys[kid]; ok {
		return k, nil
	}
	return nil, fmt.Errorf("key not found for kid=%s", kid)
}
