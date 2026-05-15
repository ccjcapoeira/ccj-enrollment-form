#!/usr/bin/env bash

set -euo pipefail

INTERVAL="${1:-120}"

if ! [[ "$INTERVAL" =~ ^[0-9]+$ ]]; then
  echo "Interval must be a number of seconds."
  exit 1
fi

echo "[autosync-loop] start interval=${INTERVAL}s"
echo "[autosync-loop] stop with Ctrl+C"

while true; do
  "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/git-sync-safe.sh" || true
  sleep "$INTERVAL"
done
