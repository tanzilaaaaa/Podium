# Podium Backend

Go + Postgres REST API for Podium.

## Stack
- **Go 1.22+** with Gin (HTTP framework)
- **PostgreSQL** via pgx v5
- **Firebase Auth** — frontend handles login, backend verifies JWT tokens

## Architecture

```
React Frontend
  │
  ├── Firebase Auth (login/signup)  ← unchanged
  │
  └── POST /api/v1/*  ←── this server (Go)
          │
          └── PostgreSQL
```

Every request needs a Firebase ID token in the `Authorization: Bearer <token>` header.

## Setup

### 1. Prerequisites
- Go 1.22+
- PostgreSQL running locally (or use a hosted DB)

### 2. Create the database
```bash
createdb podium
psql podium -f migrations/001_init.sql
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env — set DATABASE_URL and FIREBASE_PROJECT_ID
```

### 4. Run
```bash
go run cmd/server/main.go
# Server starts on :8080
```

### 5. Build binary
```bash
go build -o podium-backend cmd/server/main.go
./podium-backend
```

## API Endpoints

All routes require `Authorization: Bearer <firebase-id-token>`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check (no auth) |
| POST | `/api/v1/auth/sync` | Upsert user after Firebase login |
| GET | `/api/v1/users/me` | Get current user profile |
| PATCH | `/api/v1/users/me` | Update display name / goals / onboarding |
| POST | `/api/v1/reps` | Submit a recording — scores server-side |
| GET | `/api/v1/reps?limit=30` | Get rep history |
| GET | `/api/v1/badges` | Get all badges with earned status |

## POST /api/v1/reps — request body
```json
{
  "promptId": "optional",
  "promptText": "Describe a challenge you overcame.",
  "category": "impromptu",
  "audioDurationSec": 45,
  "transcript": "Well um I think the biggest challenge..."
}
```

## POST /api/v1/reps — response
```json
{
  "rep": { "id": 1, "wpm": 142, "fillerCount": 3, "clarityScore": 78, ... },
  "newXp": 320,
  "newLevel": 3,
  "newStreak": 5,
  "leveledUp": false,
  "xpEarned": 70,
  "newBadges": []
}
```
