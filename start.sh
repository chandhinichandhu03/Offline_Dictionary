#!/usr/bin/env bash
# ============================================================
#  LexiLearn — Start both Backend and Frontend
# ============================================================
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║         LexiLearn Startup Script         ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── Kill any process already using port 8000 ──────────────
PORT_PID=$(lsof -ti :8000 2>/dev/null || true)
if [ -n "$PORT_PID" ]; then
  echo "⚠️  Port 8000 is in use (PID $PORT_PID). Stopping it..."
  kill -9 $PORT_PID 2>/dev/null || true
  sleep 1
  echo "✅ Port 8000 freed."
fi

# ── Kill any process already using port 5173 ──────────────
PORT_PID2=$(lsof -ti :5173 2>/dev/null || true)
if [ -n "$PORT_PID2" ]; then
  echo "⚠️  Port 5173 is in use (PID $PORT_PID2). Stopping it..."
  kill -9 $PORT_PID2 2>/dev/null || true
  sleep 1
  echo "✅ Port 5173 freed."
fi

# ── Start Backend ──────────────────────────────────────────
echo ""
echo "🚀 Starting Backend (FastAPI on port 8000)..."
cd "$BACKEND_DIR"
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
echo "✅ Backend started (PID $BACKEND_PID)"

# Give backend a moment to boot
sleep 2

# ── Start Frontend ─────────────────────────────────────────
echo ""
echo "🎨 Starting Frontend (Vite on port 5173)..."
cd "$FRONTEND_DIR"

echo ""
echo "══════════════════════════════════════════════"
echo "  ✅ LexiLearn is starting!"
echo "  🌐 Frontend : http://localhost:5173"
echo "  🔌 Backend  : http://localhost:8000"
echo "  📚 API Docs : http://localhost:8000/docs"
echo ""
echo "  🔑 Default Login Credentials:"
echo "     Admin   → username: admin    password: Admin@123"
echo "     User    → username: demo     password: Demo1234!"
echo ""
echo "  Press Ctrl+C to stop the frontend."
echo "  To stop the backend: kill $BACKEND_PID"
echo "══════════════════════════════════════════════"
echo ""

npm run dev

# Clean up backend when frontend exits
kill $BACKEND_PID 2>/dev/null || true
echo ""
echo "👋 LexiLearn stopped."


bash /Users/ashokkumar/Downloads/offline_dictionary/start.sh
