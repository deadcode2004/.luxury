#!/usr/bin/env bash
# Start ONLY Laravel. Never touches the Next.js process.
# Uses PHP_CLI_SERVER_WORKERS so realtime polling + page loads do not serialize
# on the single-threaded built-in server (root cause of "API disconnects").
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/dev-env.sh
source "$ROOT/scripts/lib/dev-env.sh"

API_PORT="$(read_api_port)"
# Allow override: API_PORT=8001 npm run dev:laravel
API_PORT="${API_PORT_OVERRIDE:-${API_PORT}}"
sync_laravel_app_url "$API_PORT"

if http_ok "http://127.0.0.1:${API_PORT}/api/v1/products"; then
  echo "✓ Laravel already healthy on http://127.0.0.1:${API_PORT}"
  echo "  Leaving existing process running (Next is untouched)."
  exit 0
fi

free_port "$API_PORT"

# Multi-worker built-in server (PHP 7.4+). Without this, concurrent Chrome/Firefox
# + realtime polls block each other and the storefront looks "stale/disconnected".
export PHP_CLI_SERVER_WORKERS="${PHP_CLI_SERVER_WORKERS:-4}"

echo "→ Laravel http://127.0.0.1:${API_PORT} (workers=${PHP_CLI_SERVER_WORKERS})"
echo "  Next proxy must use API_PROXY_ORIGIN=http://127.0.0.1:${API_PORT}"
cd "$ROOT/backend"
exec php artisan serve --host=127.0.0.1 --port="$API_PORT"
