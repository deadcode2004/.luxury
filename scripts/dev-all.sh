#!/usr/bin/env bash
# Start Laravel + Next together without cross-killing processes.
# Uses concurrently so either side can restart independently later via
# `npm run dev:laravel` / `npm run dev:next`.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/dev-env.sh
source "$ROOT/scripts/lib/dev-env.sh"

API_PORT="$(read_api_port)"
NEXT_PORT="$(read_next_port)"
sync_laravel_app_url "$API_PORT"

echo "→ Dev stack"
echo "  Next    http://localhost:${NEXT_PORT}"
echo "  Laravel http://127.0.0.1:${API_PORT}"
echo "  SSOT    $ENV_LOCAL"

# Free only our ports (no global pkill of next-server / artisan).
free_port "$NEXT_PORT"
free_port "$API_PORT"
free_port 3001

if [[ "${CLEAN:-0}" == "1" ]]; then
  echo "→ Clearing .next"
  rm -rf "$ROOT/.next"
fi

cd "$ROOT"
export PHP_CLI_SERVER_WORKERS="${PHP_CLI_SERVER_WORKERS:-4}"
export API_PORT_OVERRIDE="$API_PORT"

exec npx --yes concurrently \
  --names "laravel,next" \
  --prefix-colors "magenta,cyan" \
  --kill-others-on-fail=false \
  "bash scripts/dev-laravel.sh" \
  "bash -c 'sleep 1; CLEAN=${CLEAN:-0} bash scripts/dev-next.sh'"
