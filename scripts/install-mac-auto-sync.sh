#!/usr/bin/env bash

set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This installer supports macOS only."
  exit 1
fi

INTERVAL="${1:-120}"
AUTO_COMMIT="${2:-0}"

if ! [[ "$INTERVAL" =~ ^[0-9]+$ ]]; then
  echo "Interval must be a number of seconds."
  exit 1
fi

if [[ "$AUTO_COMMIT" != "0" && "$AUTO_COMMIT" != "1" ]]; then
  echo "AUTO_COMMIT must be 0 or 1."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
PLIST_PATH="$LAUNCH_AGENTS_DIR/com.ccj.enrollment-form.autosync.plist"

# On modern macOS, background LaunchAgents often cannot access protected folders
# such as Desktop/Documents/Downloads unless explicitly allowed.
if [[ "${ALLOW_PROTECTED_DIR:-0}" != "1" ]]; then
  if [[ "$REPO_ROOT" == *"/Desktop/"* || "$REPO_ROOT" == *"/Documents/"* || "$REPO_ROOT" == *"/Downloads/"* ]]; then
    echo "Repository is in a protected folder: $REPO_ROOT"
    echo "Move it to a non-protected path (example: \$HOME/Github/...) and run installer again."
    echo "If you still want to continue here, run with: ALLOW_PROTECTED_DIR=1 ./scripts/install-mac-auto-sync.sh $INTERVAL $AUTO_COMMIT"
    exit 1
  fi
fi

mkdir -p "$LAUNCH_AGENTS_DIR"

cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.ccj.enrollment-form.autosync</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>-lc</string>
    <string>cd "$REPO_ROOT" &amp;&amp; AUTO_COMMIT=$AUTO_COMMIT "$REPO_ROOT/scripts/git-sync-safe.sh" &gt;&gt; "$REPO_ROOT/.autosync.log" 2&gt;&amp;1</string>
  </array>
  <key>StartInterval</key>
  <integer>$INTERVAL</integer>
  <key>RunAtLoad</key>
  <true/>
  <key>WorkingDirectory</key>
  <string>$REPO_ROOT</string>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)/com.ccj.enrollment-form.autosync" >/dev/null 2>&1 || true
launchctl bootstrap "gui/$(id -u)" "$PLIST_PATH"

echo "Installed auto sync agent:"
echo "  plist: $PLIST_PATH"
echo "  interval_sec: $INTERVAL"
echo "  auto_commit: $AUTO_COMMIT"
echo "Check log: $REPO_ROOT/.autosync.log"
