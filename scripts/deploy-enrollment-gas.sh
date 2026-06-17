#!/usr/bin/env bash
# ローカル google-apps-script.js を Apps Script に反映し、既存ウェブアプリの
# 新バージョンとしてデプロイする。
#
# 使い方:
#   cp scripts/deploy-enrollment-gas.conf.example scripts/deploy-enrollment-gas.conf
#   # conf の GAS_SCRIPT_ID を入会フォーム用スプレッドシートに紐づく Apps Script の
#   # プロジェクト設定で取得して埋める
#   ./scripts/deploy-enrollment-gas.sh
#
# 初回のみ:
#   npm install -g @google/clasp   # Node 18+ 必須
#   clasp login                     # 入会フォームと同じ Google アカウントで
set -euo pipefail

cd "$(dirname "$0")/.."

CONF_FILE="${CONF_FILE:-scripts/deploy-enrollment-gas.conf}"
if [[ ! -f "$CONF_FILE" ]]; then
  echo "設定ファイルが見つかりません: $CONF_FILE"
  echo "先に: cp scripts/deploy-enrollment-gas.conf.example scripts/deploy-enrollment-gas.conf"
  exit 1
fi

# shellcheck disable=SC1090
source "$CONF_FILE"

require_var() {
  local key="$1"
  if [[ -z "${!key:-}" ]]; then
    echo "必須設定が空です: $key"
    exit 1
  fi
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "必要コマンドが見つかりません: $cmd"
    exit 1
  fi
}

require_cmd clasp
require_var GAS_SCRIPT_ID

if [[ "${GAS_SCRIPT_ID}" == REPLACE_WITH_* ]]; then
  echo "GAS_SCRIPT_ID が未設定です。$CONF_FILE に実値を設定してください。"
  exit 1
fi

DEPLOY_DESCRIPTION="${DEPLOY_DESCRIPTION:-Auto deploy $(date '+%Y-%m-%d %H:%M:%S')}"
BUILD_DIR=".gas-build"

echo "→ Build ファイルを生成"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
cp "google-apps-script.js" "$BUILD_DIR/Code.gs"

cat > "$BUILD_DIR/appsscript.json" <<'EOF'
{
  "timeZone": "Asia/Tokyo",
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "access": "ANYONE_ANONYMOUS",
    "executeAs": "USER_DEPLOYING"
  }
}
EOF

cat > "$BUILD_DIR/.clasp.json" <<EOF
{
  "scriptId": "${GAS_SCRIPT_ID}",
  "rootDir": "."
}
EOF

cat > "$BUILD_DIR/.claspignore" <<'EOF'
**/**
!appsscript.json
!Code.gs
EOF

echo "→ Apps Script へ push"
(cd "$BUILD_DIR" && clasp push -f)

if [[ -n "${GAS_DEPLOYMENT_ID:-}" ]]; then
  echo "→ 既存ウェブアプリの新バージョンをデプロイ: $GAS_DEPLOYMENT_ID"
  (cd "$BUILD_DIR" && clasp update-deployment "$GAS_DEPLOYMENT_ID" -d "$DEPLOY_DESCRIPTION")
  DEPLOYMENT_ID="$GAS_DEPLOYMENT_ID"
else
  echo "→ 新規デプロイを作成"
  DEPLOY_OUTPUT="$(cd "$BUILD_DIR" && clasp create-deployment -d "$DEPLOY_DESCRIPTION")"
  printf '%s\n' "$DEPLOY_OUTPUT"
  DEPLOYMENT_ID="$(printf '%s\n' "$DEPLOY_OUTPUT" | python3 -c "import re,sys; s=sys.stdin.read(); m=re.search(r'AKfy[a-zA-Z0-9_-]+', s); print(m.group(0) if m else '')")"
  if [[ -z "$DEPLOYMENT_ID" ]]; then
    echo "デプロイIDの取得に失敗しました。"
    exit 1
  fi
  echo "新規 deploymentId: $DEPLOYMENT_ID"
  echo "次回以降は conf の GAS_DEPLOYMENT_ID に上記を設定すれば URL 固定で更新できます。"
fi

WEBAPP_URL="https://script.google.com/macros/s/${DEPLOYMENT_ID}/exec"
echo ""
echo "完了: $WEBAPP_URL"
echo "→ index.html / plan-change.html / leave-request.html の SCRIPT_URL がこの URL と一致しているか確認してください。"
