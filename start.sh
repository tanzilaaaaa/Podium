#!/bin/zsh
# Start Podium — runs both servers
# Usage: ./start.sh

export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"

echo "Starting Podium..."
echo ""

# Check Postgres
if ! pg_isready -q 2>/dev/null; then
  echo "Starting PostgreSQL..."
  brew services start postgresql@16
  sleep 2
fi

# Build backend if binary is missing or source changed
cd "$(dirname "$0")/backend"
if [ ! -f podium-backend ] || [ cmd/server/main.go -nt podium-backend ]; then
  echo "Building backend..."
  go build -o podium-backend cmd/server/main.go
fi

# Start backend in background
echo "Starting Go backend on :8080"
./podium-backend &
BACKEND_PID=$!

# Start frontend
cd "$(dirname "$0")/podium"
echo "Starting frontend on :5173"
echo ""
echo "  App: http://localhost:5173"
echo "  API: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Kill backend when frontend exits
trap "kill $BACKEND_PID 2>/dev/null; echo 'Servers stopped.'" EXIT

npm run dev
