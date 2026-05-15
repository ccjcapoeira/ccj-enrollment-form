#!/usr/bin/env bash

set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This uninstaller supports macOS only."
  exit 1
fi

PLIST_PATH="$HOME/Library/LaunchAgents/com.ccj.enrollment-form.autosync.plist"
LABEL="gui/$(id -u)/com.ccj.enrollment-form.autosync"

launchctl bootout "$LABEL" >/dev/null 2>&1 || true
rm -f "$PLIST_PATH"

echo "Auto sync agent removed."
echo "Log file in repository (.autosync.log) is kept as-is."
