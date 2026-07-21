#!/usr/bin/env bash
# Start ONLY Next.js. Never touches the Laravel process.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/dev-env.sh
source "$ROOT/scripts/lib/dev-env.sh"

NEXT_PORT="$(read_next_port)"
API_PORT="$(read_api_port)"
sync_laravel_app_url "$API_PORT"

if http_ok "http://127.0.0.1:${NEXT_PORT}/"; then
  echo "✓ Next.js already healthy on http://localhost:${NEXT_PORT}"
  echo "  Leaving existing process running (Laravel is untouched)."
  exit 0
fi

# Only free the Next port — never kill Laravel on :API_PORT.
free_port "$NEXT_PORT"
# Accidental production preview must not steal traffic.
free_port 3001

if [[ "${CLEAN:-0}" == "1" ]]; then
  echo "→ Clearing .next"
  rm -rf "$ROOT/.next"
fi

if ! http_ok "http://127.0.0.1:${API_PORT}/api/v1/products"; then
  echo "⚠ Laravel is not reachable at http://127.0.0.1:${API_PORT}"
  echo "  Start it in another terminal: npm run dev:laravel"
fi

echo "→ Next.js http://localhost:${NEXT_PORT}"
echo "  Proxy → http://127.0.0.1:${API_PORT} (from .env.local)"
cd "$ROOT"
exec npm run dev -- --hostname 0.0.0.0 --port "$NEXT_PORT"
