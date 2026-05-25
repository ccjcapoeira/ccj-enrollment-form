# CCJ.CAPOEIRA OSAKA 入会申し込みフォーム

カポエイラ教室（CCJ.CAPOEIRA OSAKA）の入会申し込みWebフォームです。

## 本番フォーム（GitHub Pages）

次のURLで公開されています（閲覧・申し込み用）。

- 入会: https://ccjcapoeira.github.io/ccj-enrollment-form/
- プラン変更（会員向け）: https://ccjcapoeira.github.io/ccj-enrollment-form/plan-change.html
- 退会のお手続き（会員向け）: https://ccjcapoeira.github.io/ccj-enrollment-form/leave-request.html

### URL移管記録（2026-05-11）

- GitHubリポジトリを `soquetecapoeira-max/ccj-enrollment-form` から `ccjcapoeira/ccj-enrollment-form` へ移管済み
- ローカルの `origin` は `https://github.com/ccjcapoeira/ccj-enrollment-form.git` に変更済み
- GitHub Pages は `main` ブランチ `/` から公開、状態は `built` を確認済み
- 旧URL `https://soquetecapoeira-max.github.io/ccj-enrollment-form/` は 404 で利用不可
- 新URLの入会 / プラン変更 / 退会 / 入会規約ページは表示確認済み
- 移管手順と確認項目は `docs/github-url-migration-to-ccjcapoeira.md` に記録

## 機能

- コース選択（レギュラー / アドバンス / プロ / キッズ / ドロップイン）
- コースに応じた支払い方法の自動切替
  - ドロップイン → 現金のみ
  - その他のコース → クレジットカード(PayPal) / 口座振替
- キッズクラス選択時は保護者氏名が必須に
- 郵便番号から住所自動入力（zipcloud API）
- 入力内容の確認画面
- 支払い方法に応じた完了画面の次アクション表示
- 任意項目（予備電話番号 / 予備メールアドレス / 備考）対応
- Google スプレッドシートへのデータ自動保存
- 申し込み者への確認メール自動送信（任意）
- **プラン変更 / 休会希望**（`plan-change.html`）— 会員向け。現在休会中の方の復帰希望、在籍中の方の休会希望も同じフォームで受け付け、休会希望時は開始希望月・再開予定月・理由を記録します。申請内容はスプレッドシートの「プラン変更」シートに追記（初回送信時にシートが無ければ GAS が作成）
- **退会のお手続き**（`leave-request.html`）— 会員向け。送信内容はスプレッドシートの「退会手続き」シートに保存され、フォーム送信をもって手続き完了

## セットアップ手順

### 1. Google スプレッドシートの準備

1. [Google スプレッドシート](https://sheets.google.com/)を新規作成
2. 1行目（ヘッダー）に以下を入力：

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 入会申込日 | コース | 氏名 | フリガナ | 生年月日 | 電話番号 | 予備電話番号 | メールアドレス | 予備メールアドレス | 郵便番号 | 住所1 | 住所2 | 保護者氏名 | 支払い方法 | 年会費規定同意 | 個人情報取扱同意 | 規約バージョン | 備考 |

### 2. Google Apps Script の設定

1. スプレッドシートのメニュー「**拡張機能**」→「**Apps Script**」を開く
2. `google-apps-script.js` の中身をすべてコピーして貼り付け
3. 保存（Ctrl+S）

### 3. デプロイ

1. 「**デプロイ**」→「**新しいデプロイ**」
2. 種類: **ウェブアプリ**
3. 説明: `入会フォーム` など（任意）
4. 実行するユーザー: **自分**
5. アクセスできるユーザー: **全員**
6. 「**デプロイ**」をクリック
7. 表示される **URL をコピー**

### 4. フォームとの連携

このリポジトリの `index.html`・`plan-change.html`・`leave-request.html` には、運用用の Google Apps Script の **同一 URL が設定されています**（1 本のウェブアプリで入会 / プラン変更 / 退会手続きを受け付けます）。自分用のスプレッドシートとスクリプトを新規に用意した場合だけ、**3ファイルすべて**の `SCRIPT_URL` を書き換えてください。

```javascript
const SCRIPT_URL = 'https://script.google.com/macros/s/xxxxxxxxxxxx/exec';
```

初回セットアップ時は空文字のままにしておき、デプロイ後に貼り付けても構いません。未設定のときはデモモード（コンソール出力のみ）で動作します。

**プラン変更 / 退会手続きを使うとき:** スプレッドシートに紐づいた Apps Script のエディタを開き、リポジトリの `google-apps-script.js` の内容に**置き換え**たうえで、「デプロイ」→「デプロイを管理」→ 既存ウェブアプリの **新バージョンをデプロイ** してください（コード差し替えのみでは反映されません）。

### 5. 公開

`index.html` / `plan-change.html` / `leave-request.html` / `terms-adult.html` を、以下のいずれかの方法で公開：

- **既存のホームページに設置** — HTMLをグーペやサーバーにアップロード
- **GitHub Pages** — このリポジトリのSettingsからPages有効化
- **Netlify / Vercel** — ドラッグ&ドロップで簡単デプロイ

## ファイル構成

```
ccj-enrollment-form/
├── index.html              # 入会フォーム（HTML + CSS + JS 一体型）
├── terms-adult.html        # 入会規約（大人向け）表示ページ
├── plan-change.html        # プラン変更（会員向け）
├── leave-request.html      # 退会のお手続き（会員向け）
├── google-apps-script.js   # Google Apps Script（スプレッドシート連携用）
├── docs/
│   ├── contract-alignment-report.md # 紙とWebの整合差分と対応履歴
│   ├── github-url-migration-to-ccjcapoeira.md # GitHub Pages URL移管手順と記録
│   └── member-services.md  # プラン変更・休会・大会など拡張の設計メモ
├── PROGRESS.md             # 進捗・デプロイ情報のメモ（運用向け）
└── README.md               # このファイル
```

## メンバー向け手続きの拡張

**プラン変更（フェーズ1）は実装済み**です。簡易的な休会希望は `plan-change.html` で受け付けます。独立した休会フォームや大会など今後の足し方は次のドキュメントにまとめています。

[docs/member-services.md](docs/member-services.md)

## カスタマイズ

### 色の変更

`index.html` の `:root` セクションでカラー変数を変更できます：

```css
:root {
  --green: #00854A;       /* メインカラー */
  --yellow: #F5C518;      /* アクセントカラー */
}
```

### コース情報の更新

入会は `index.html` の `.course-option`、プラン変更・休会希望は `plan-change.html` 内のコース用 `<select>` を編集してください（表記を揃えること）。

## 注意事項

- Google Apps Script のURLが未設定の場合、フォームはデモモードで動作します（送信データはコンソールに出力）
- 確認メール機能を使わない場合は `google-apps-script.js` 内の `sendConfirmationEmail(data);` の行を削除してください
- プラン変更・休会希望の確認メールを止める場合は `handlePlanChange_` 内の `sendPlanChangeConfirmationEmail_(p);` を削除してください
- 既存の「プラン変更」シートに休会用の列が無い場合、GAS が初回送信時に `休会開始希望月` / `再開予定月` / `休会理由` の列を自動追加します
- 入会用データは、シート名が **入会** のタブがあればそこに、なければ **ブック内の先頭シート** に書き込みます
- 規約の正本は `terms-adult.html` とし、旧紙規約は新規案内で使用しません
- 規約変更時は `terms-adult.html` を更新し、`docs/contract-alignment-report.md` に承認記録を追記してください

## 2台PC同期（push / pull 自動化）

このリポジトリには、macOS向けの自動同期スクリプトを同梱しています。

- `scripts/git-sync-safe.sh`  
  安全同期スクリプト（`pull --rebase` + `push`）。競合や未コミット変更がある場合は同期を止めます。
- `scripts/install-mac-auto-sync.sh`  
  LaunchAgent を登録して、指定秒ごとに自動同期します。
- `scripts/uninstall-mac-auto-sync.sh`  
  自動同期設定の解除用です。
- `scripts/run-sync-loop.sh`  
  ターミナル常駐型の自動同期（LaunchAgent を使わない代替手段）

### 設定手順（両方のPCで同じ）

1. このリポジトリのルートで実行
2. 実行権限を付与
3. 自動同期をインストール

```bash
chmod +x scripts/git-sync-safe.sh scripts/install-mac-auto-sync.sh scripts/uninstall-mac-auto-sync.sh
./scripts/install-mac-auto-sync.sh 120 0
```

- 第1引数 `120`: 実行間隔（秒）
- 第2引数 `0`: 自動コミットOFF（推奨）
  - `1` にすると、未コミット変更を自動コミットしてから push/pull します
- リポジトリが `Desktop` / `Documents` / `Downloads` 配下にある場合、macOSの権限制約で LaunchAgent が失敗することがあります  
  - その場合は `~/Github/...` など保護フォルダ外へ移動してから実行してください
  - 強制実行したい場合は `ALLOW_PROTECTED_DIR=1` を付けて実行できます

### 動作確認

```bash
launchctl print gui/$(id -u)/com.ccj.enrollment-form.autosync
```

ログはリポジトリ直下の `.autosync.log` に追記されます。

### 停止（解除）

```bash
./scripts/uninstall-mac-auto-sync.sh
```

### LaunchAgent が使えない場合の代替（Desktop配下など）

```bash
chmod +x scripts/run-sync-loop.sh
./scripts/run-sync-loop.sh 120
```

この方法は、ターミナルを開いている間だけ 120 秒ごとに同期します（`Ctrl+C` で停止）。
