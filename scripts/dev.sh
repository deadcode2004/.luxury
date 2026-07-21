#!/usr/bin/env bash
# Single-stack local development launcher.
# Prevents the Chrome/Firefox split caused by running `next start` and `next dev`
# (or multiple Next processes) at the same time.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NEXT_PORT="${NEXT_PORT:-3000}"
API_PORT="${API_PORT:-8000}"
CLEAN="${CLEAN:-0}"

kill_port() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [[ -n "${pids}" ]]; then
      echo "Stopping process(es) on :${port}: ${pids}"
      # shellcheck disable=SC2086
      kill ${pids} 2>/dev/null || true
      sleep 0.5
      # shellcheck disable=SC2086
      kill -9 ${pids} 2>/dev/null || true
    fi
  elif command -v fuser >/dev/null 2>&1; then
    fuser -k "${port}/tcp" 2>/dev/null || true
  fi
}

echo "→ Ensuring a single Next (:${NEXT_PORT}) + Laravel (:${API_PORT}) stack"
kill_port "$NEXT_PORT"
kill_port "$API_PORT"
# Also clear the accidental production preview port if present.
kill_port 3001

# Stale next start / next dev leftovers
pkill -f "next start" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 0.5

if [[ "$CLEAN" == "1" ]]; then
  echo "→ Clearing .next (clean dev boot)"
  rm -rf "$ROOT/.next"
fi

cd "$ROOT/backend"
php artisan serve --host=0.0.0.0 --port="$API_PORT" &
API_PID=$!

cleanup() {
  kill "$API_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

cd "$ROOT"
echo "→ Next.js dev on http://localhost:${NEXT_PORT} (do not also run npm start)"
npm run dev -- --hostname 0.0.0.0 --port "$NEXT_PORT"
