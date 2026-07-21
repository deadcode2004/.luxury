#!/usr/bin/env bash
# Shared local-dev helpers. `.env.local` is the single source of truth for the
# Laravel proxy origin so Next rewrites and `artisan serve` never drift apart.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_LOCAL="$ROOT/.env.local"
BACKEND_ENV="$ROOT/backend/.env"

# Canonical local ports — do not change ad-hoc (8000/8001 flip caused stale/broken UI).
DEFAULT_NEXT_PORT=3000
DEFAULT_API_PORT=8000

ensure_env_local() {
  if [[ ! -f "$ENV_LOCAL" ]]; then
    if [[ -f "$ROOT/.env.example" ]]; then
      cp "$ROOT/.env.example" "$ENV_LOCAL"
    else
      cat >"$ENV_LOCAL" <<EOF
NEXT_PUBLIC_API_URL=/api/v1
API_PROXY_ORIGIN=http://127.0.0.1:${DEFAULT_API_PORT}
NEXT_PUBLIC_SITE_URL=http://localhost:${DEFAULT_NEXT_PORT}
EOF
    fi
  fi
}

read_api_port() {
  ensure_env_local
  local origin
  origin="$(rg -n '^API_PROXY_ORIGIN=' "$ENV_LOCAL" | head -1 | cut -d= -f2- | tr -d '\r' || true)"
  if [[ "$origin" =~ :([0-9]+)/?$ ]]; then
    echo "${BASH_REMATCH[1]}"
  else
    echo "$DEFAULT_API_PORT"
  fi
}

read_next_port() {
  echo "${NEXT_PORT:-$DEFAULT_NEXT_PORT}"
}

set_env_key_if_changed() {
  local file="$1"
  local key="$2"
  local value="$3"
  local current=""

  if [[ -f "$file" ]] && rg -q "^${key}=" "$file"; then
    current="$(rg -n "^${key}=" "$file" | head -1 | cut -d= -f2- | tr -d '\r')"
    if [[ "$current" == "$value" ]]; then
      return 0
    fi
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
    echo "→ Updated ${file##*/}: ${key}=${value}"
  else
    echo "${key}=${value}" >>"$file"
    echo "→ Added ${file##*/}: ${key}=${value}"
  fi
}

sync_laravel_app_url() {
  local port="$1"
  local origin="http://127.0.0.1:${port}"
  ensure_env_local

  # IMPORTANT: only rewrite when the value actually changes.
  # `php artisan serve` watches `.env` and restarts on any mtime change — that
  # brief outage made the storefront look "disconnected/stale" whenever Next started.
  set_env_key_if_changed "$ENV_LOCAL" "API_PROXY_ORIGIN" "$origin"

  if [[ -f "$BACKEND_ENV" ]]; then
    set_env_key_if_changed "$BACKEND_ENV" "APP_URL" "$origin"
  fi
}

port_in_use() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -tiTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
    return $?
  fi
  if command -v ss >/dev/null 2>&1; then
    ss -tln "sport = :$port" 2>/dev/null | rg -q ":${port}\\b"
    return $?
  fi
  return 1
}

# Free a port only if something is listening — never pkill unrelated Next/Laravel.
free_port() {
  local port="$1"
  if ! port_in_use "$port"; then
    return 0
  fi
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [[ -n "${pids}" ]]; then
      echo "→ Freeing :${port} (pids: ${pids})"
      # shellcheck disable=SC2086
      kill ${pids} 2>/dev/null || true
      sleep 0.4
      # shellcheck disable=SC2086
      kill -9 ${pids} 2>/dev/null || true
    fi
  elif command -v fuser >/dev/null 2>&1; then
    fuser -k "${port}/tcp" 2>/dev/null || true
  fi
}

http_ok() {
  local url="$1"
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 "$url" || true)"
  [[ "$code" =~ ^[23] ]]
}
