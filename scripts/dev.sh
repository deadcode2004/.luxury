#!/usr/bin/env bash
# Back-compat entrypoint → stable dual process launcher.
exec "$(cd "$(dirname "$0")" && pwd)/dev-all.sh" "$@"
