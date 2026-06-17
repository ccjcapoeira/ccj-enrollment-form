# Apps Script（GAS）デプロイ手順書

入会フォームの **裏側プログラム**（`google-apps-script.js`）を、Mac 上から Google に送って **本番に反映する** 手順です。

> **覚えることは1つだけ**  
> `google-apps-script.js` を直したら → `./scripts/deploy-enrollment-gas.sh` を実行

---

## これは何のため？

入会フォームは2か所にプログラムがあります。

| 場所 | ファイル | 役割 |
|------|----------|------|
| **GitHub Pages** | `index.html` など | 画面の見た目・入力フォーム |
| **Google Apps Script** | `google-apps-script.js` | 送信を受け取る・スプレッドシート保存・メール送信 |

`google-apps-script.js` を Mac で直しただけでは、**Google 上の本番プログラムは古いまま** です。  
この手順で「Google に送る」＋「本番 URL を新しいプログラムに切り替える」を行います。

---

## いつこの手順が必要？

| 変更したもの | デプロイ必要？ |
|--------------|----------------|
| `google-apps-script.js`（メール文面・保存処理など） | **必要** |
| `index.html` / `plan-change.html`（画面・デザイン） | 不要（GitHub に push すれば OK） |

---

## 初回セットアップ（1回だけ）

### 1. 必要なもの

- Mac に **Node.js**（18 以上推奨）
- **clasp**（Google Apps Script 用のコマンドラインツール）
- 入会フォーム用 **Google アカウント**（`ccj.osaka@gmail.com` など）

### 2. clasp をインストール

ターミナルで実行:

```bash
npm install -g @google/clasp
```

インストール確認:

```bash
clasp --version
```

### 3. Google にログイン

```bash
clasp login
```

ブラウザが開くので、**入会フォームのスプレッドシートと同じ Google アカウント** で許可してください。

### 4. 設定ファイルを用意

リポジトリのフォルダに移動:

```bash
cd /Users/kuboyamatakeshi/GitHub/ccj-enrollment-form
```

設定ファイルをコピー:

```bash
cp scripts/deploy-enrollment-gas.conf.example scripts/deploy-enrollment-gas.conf
```

> `deploy-enrollment-gas.conf` は Git に含めません（ID が入るため）。

### 5. 設定ファイルに ID を入れる

`scripts/deploy-enrollment-gas.conf` をテキストエディタで開き、次の2つを埋めます。

#### GAS_SCRIPT_ID（スクリプト ID）

1. Google スプレッドシート **「CCJカポエイラ入会申し込み」** を開く
2. メニュー **拡張機能 → Apps Script**
3. 左下の **⚙ プロジェクトの設定**
4. **スクリプト ID** をコピー

例:

```bash
GAS_SCRIPT_ID="1r9JX7Gl7cLNfAUsmFM_La0PS4fkTMTX35l76uGhjgFfQUfdDSs_cwDR3"
```

#### GAS_DEPLOYMENT_ID（デプロイ ID）

1. Apps Script 画面右上 **デプロイ → デプロイを管理**
2. 種類が **ウェブアプリ** の行を選ぶ
3. **デプロイ ID**（`AKfy...` で始まる長い文字列）をコピー

例:

```bash
GAS_DEPLOYMENT_ID="AKfycbxrVHm38s5AjyAVRdQEeIRBtjZAQ4tnCT2deRMDx0VC7XaiZtpkWoboaPlBIlnBDz3v4g"
```

> **重要:** `GAS_DEPLOYMENT_ID` を入れておくと、フォームの URL が **変わらず** 中身だけ更新できます。  
> 空のまま実行すると **新しい URL が発行** され、`index.html` の `SCRIPT_URL` も書き換えが必要になります。

#### DEPLOY_DESCRIPTION（任意）

何を変更したかのメモ。デプロイ履歴に残ります。

```bash
DEPLOY_DESCRIPTION="2026-06-17 管理通知メールに初回費用を追加"
```

---

## いつもの手順（2〜3分）

コードを直したあと、毎回これだけです。

### ステップ 1: `google-apps-script.js` を編集

リポジトリ直下のこのファイルが **正本** です。

- お客さん向けメール → `sendConfirmationEmail`
- 事務局向け通知 → `sendOwnerEnrollmentNotification_`
- 初回費用の計算 → `buildInitialPaymentGuide_`

文面の一覧は `docs/email-templates.md` も参照。

### ステップ 2: デプロイスクリプトを実行

```bash
cd /Users/kuboyamatakeshi/GitHub/ccj-enrollment-form
./scripts/deploy-enrollment-gas.sh
```

変更内容をメモしたいとき:

```bash
DEPLOY_DESCRIPTION="変更内容をここに書く" ./scripts/deploy-enrollment-gas.sh
```

### ステップ 3: 成功したか確認

ターミナルに次のような表示が出れば OK です。

```text
→ Apps Script へ push
Pushed 2 files at ...
→ 既存ウェブアプリの新バージョンをデプロイ: AKfycbx...
Redeployed AKfycbx... @13

完了: https://script.google.com/macros/s/AKfycbx.../exec
```

チェックポイント:

- [ ] エラーで止まっていない
- [ ] `@数字`（例: `@13`）が前回より大きい
- [ ] 末尾の URL が **いつもと同じ**（`AKfycbx...` の部分）

### ステップ 4: 動作確認（任意）

ブラウザで次の URL を開くと、API が動いている表示になります。

```text
https://script.google.com/macros/s/AKfycbxrVHm38s5AjyAVRdQEeIRBtjZAQ4tnCT2deRMDx0VC7XaiZtpkWoboaPlBIlnBDz3v4g/exec
```

表示例: `CCJ.CAPOEIRA OSAKA フォーム API（入会・プラン変更・退会） is running.`

本番確認は、テスト用の入会申込を1件送るか、メール文面が意図どおりか次の本番申込で確認します。

---

## スクリプトの中で何をしているか

`./scripts/deploy-enrollment-gas.sh` は、手動でやっていた作業を自動化しています。

```
google-apps-script.js（Mac）
        │
        ▼ コピー
   .gas-build/Code.gs
        │
        ▼ clasp push
 Google Apps Script（クラウド上のプログラム）
        │
        ▼ clasp update-deployment
 既存ウェブアプリの新バージョン（@12 → @13 …）
        │
        ▼
フォームの URL はそのまま・中身だけ更新
```

| 処理 | 意味 |
|------|------|
| `clasp push` | プログラムを Google にアップロード |
| `clasp update-deployment` | フォームが使う URL を新プログラムに切り替え |

**push だけでは本番に反映されません。** 必ず `update-deployment` まで実行します（このスクリプトが両方やります）。

---

## 本番環境の参照値（2026-06-17 時点）

| 項目 | 値 |
|------|-----|
| ウェブアプリ URL | https://script.google.com/macros/s/AKfycbxrVHm38s5AjyAVRdQEeIRBtjZAQ4tnCT2deRMDx0VC7XaiZtpkWoboaPlBIlnBDz3v4g/exec |
| スプレッドシート | CCJカポエイラ入会申し込み |
| 最新デプロイ例 | @13（管理通知に初回費用追加） |
| 管理者通知先 | ccj.osaka@gmail.com |

`index.html` / `plan-change.html` / `leave-request.html` の `SCRIPT_URL` は、上記 URL と一致している必要があります。  
**デプロイ ID を変えずに更新している限り、SCRIPT_URL の書き換えは不要** です。

---

## うまくいかないとき

### `clasp: command not found`

clasp が入っていません。

```bash
npm install -g @google/clasp
```

### ログインエラー・権限エラー

```bash
clasp login
```

をやり直し、入会フォーム用の Google アカウントで許可してください。

### `設定ファイルが見つかりません`

```bash
cp scripts/deploy-enrollment-gas.conf.example scripts/deploy-enrollment-gas.conf
```

を実行し、ID を埋めてください。

### URL が変わってしまった

`GAS_DEPLOYMENT_ID` が空だった、または新規デプロイが作られた可能性があります。

1. ターミナルに表示された新しい `AKfy...` を控える
2. `deploy-enrollment-gas.conf` の `GAS_DEPLOYMENT_ID` に設定
3. `index.html` / `plan-change.html` / `leave-request.html` の `SCRIPT_URL` も同じ URL に更新
4. GitHub Pages に反映（git push）

### 手動でやる場合（スクリプトが使えないとき）

1. スプレッドシート → **拡張機能 → Apps Script**
2. `google-apps-script.js` の内容をすべてコピーして貼り付け・保存
3. **デプロイ → デプロイを管理**
4. 既存の **ウェブアプリ** を選び **新バージョンをデプロイ**

貼り付けだけでは反映されないので、**必ず「新バージョンをデプロイ」** まで行ってください。

---

## 関連ファイル

| ファイル | 説明 |
|----------|------|
| `google-apps-script.js` | 編集する正本 |
| `scripts/deploy-enrollment-gas.sh` | デプロイ用スクリプト |
| `scripts/deploy-enrollment-gas.conf` | ID 設定（各自の Mac にのみ存在） |
| `scripts/deploy-enrollment-gas.conf.example` | 設定のひな形 |
| `docs/email-templates.md` | メール文面の整理版 |
| `PROGRESS.md` | デプロイ履歴・URL のメモ |

---

## クイックリファレンス（コピペ用）

```bash
# 毎回これだけ
cd /Users/kuboyamatakeshi/GitHub/ccj-enrollment-form
./scripts/deploy-enrollment-gas.sh

# メモ付き
DEPLOY_DESCRIPTION="変更内容" ./scripts/deploy-enrollment-gas.sh

# バージョン一覧確認（任意）
cd .gas-build && clasp list-deployments
```
