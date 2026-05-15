#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[autosync] Not a git repository: $REPO_ROOT"
  exit 1
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$BRANCH" == "HEAD" ]]; then
  echo "[autosync] Detached HEAD. Sync skipped."
  exit 0
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "[autosync] origin remote not found. Sync skipped."
  exit 0
fi

GIT_DIR="$(git rev-parse --git-dir)"
if [[ -f "$GIT_DIR/MERGE_HEAD" || -d "$GIT_DIR/rebase-merge" || -d "$GIT_DIR/rebase-apply" ]]; then
  echo "[autosync] Merge/Rebase in progress. Sync skipped."
  exit 0
fi

if [[ -n "$(git status --porcelain)" ]]; then
  if [[ "${AUTO_COMMIT:-0}" == "1" ]]; then
    git add -A
    if [[ -n "$(git diff --cached --name-only)" ]]; then
      git commit -m "chore: auto sync $(date '+%Y-%m-%d %H:%M:%S')"
      echo "[autosync] Auto commit created."
    fi
  else
    echo "[autosync] Uncommitted changes found. Commit first, or set AUTO_COMMIT=1."
    exit 0
  fi
fi

git fetch origin "$BRANCH"
git pull --rebase --autostash origin "$BRANCH"
git push origin "$BRANCH"

echo "[autosync] Sync completed on branch: $BRANCH"
