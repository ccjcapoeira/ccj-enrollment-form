# CCJ.CAPOEIRA OSAKA 入会フォーム — 進捗メモ

最終更新: 2026年4月16日

---

## 次回ここから（セッションの続き）

作業を中断したときは、このブロックから再開してください。

| 項目 | 内容 |
|------|------|
| リポジトリ | `/Users/kuboyamatakeshi/Desktop/GitHub/ccj-enrollment-form`（`main` にプッシュ済み） |
| 直近まで完了 | プラン変更フォーム `plan-change.html`、GAS の `plan_change` 分岐、ドキュメント更新 |
| **次にやるとよいこと** | 1) スプレッドシートの Apps Script に `google-apps-script.js` を貼り直し、**ウェブアプリを新バージョンで再デプロイ**（未実施なら必須） 2) `plan-change.html` からテスト送信し、「プラン変更」シートとメールを確認 3) 休会・大会などは `docs/member-services.md` のフェーズ2以降 |
| 主要ファイル | `index.html`（入会）、`plan-change.html`（プラン変更）、`google-apps-script.js`（GAS 実体はスプレッドシート側） |

---

## 完了したこと

- [x] フォームの要件整理
- [x] `index.html` 作成（デザイン・バリデーション・条件分岐すべて込み）
- [x] `google-apps-script.js` 作成（スプレッドシート連携 + 確認メール自動送信）
- [x] Google スプレッドシート「CCJカポエイラ入会申し込み」作成済み（ヘッダー行入力済み）
- [x] Google Apps Script にコード貼り付け・デプロイ済み
- [x] デプロイURL を `index.html` の `SCRIPT_URL` に設定済み
- [x] 支払い方法の表示を「クレジットカード(PayPal)」に変更済み
- [x] 送信ボタンの不具合修正済み（type="submit" → type="button"）

## 完了！

- [x] **テスト送信** — スプレッドシートへのデータ保存確認済み
- [x] **GitHub Pages で公開** — URL発行済み
- [x] **プラン変更** — `plan-change.html`、GAS の `formType: plan_change` ルート、シート「プラン変更」

---

## デプロイ情報

| 項目 | 値 |
|------|-----|
| Apps Script URL | `https://script.google.com/macros/s/AKfycbxrVHm38s5AjyAVRdQEeIRBtjZAQ4tnCT2deRMDx0VC7XaiZtpkWoboaPlBIlnBDz3v4g/exec` |
| スプレッドシート名 | CCJカポエイラ入会申し込み |
| ローカルファイル | `index.html` / `plan-change.html`（同一 `SCRIPT_URL`） |

**重要（プラン変更を本番で使うとき）:** スプレッドシートの Apps Script に、リポジトリの `google-apps-script.js` を貼り直し、ウェブアプリを **新バージョンで再デプロイ** するまで、プラン変更の送信は旧コードでは処理されません。

---

## フォームの仕様

### コース一覧
1. レギュラーコース ¥6,700/月（月4回）
2. アドバンスコース ¥9,400/月（月8回）
3. プロコース ¥13,000/月（無制限）
4. キッズクラス ¥5,000/月（週2回）
5. ドロップイン ¥2,500/回

### 支払い方法
- コース1〜4: クレジットカード(PayPal) / 口座振替
- ドロップイン: 現金のみ

### フォーム項目
氏名 / フリガナ / 生年月日 / TEL / メールアドレス / 郵便番号 / 住所1 / 住所2 / 保護者氏名 / コース / 支払い方法 / 入会申込日(自動)

### 機能
- コース選択で支払い方法が自動切替
- キッズクラス選択時は保護者氏名が必須に
- 郵便番号から住所自動入力
- 送信前の確認画面
- Google スプレッドシートへ自動保存
- 申し込み者に確認メール自動送信

---

## 公開URL

- 入会: https://ccjcapoeira.github.io/ccj-enrollment-form/
- プラン変更: https://ccjcapoeira.github.io/ccj-enrollment-form/plan-change.html

## メンバー手続きの拡張（設計）

プラン変更・休会・大会などを入会フォームと同じスタックで伸ばす方針は `docs/member-services.md` に記載。

## 今後の変更について

index.html を編集した後、以下のコマンドで更新を反映できます：
```
cd /Users/kuboyamatakeshi/Desktop/GitHub/ccj-enrollment-form
git add .
git commit -m "変更内容のメモ"
git push
```
