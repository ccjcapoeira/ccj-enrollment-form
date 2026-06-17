# CCJ.CAPOEIRA OSAKA 入会フォーム — 進捗メモ

最終更新: 2026年6月17日

---

## 次回ここから（セッションの続き）

作業を中断したときは、このブロックから再開してください。

| 項目 | 内容 |
|------|------|
| リポジトリ | `/Users/kuboyamatakeshi/GitHub/ccj-enrollment-form`（`main` にプッシュ済み） |
| 直近まで完了 | 管理通知メールに **初回費用の目安**（`buildInitialPaymentGuide_`）を追加。clasp **@13** で本番デプロイ済み（2026-06-17） |
| **次にやるとよいこと** | 1) 次の入会申込で管理通知に初回費用が載ることを実送信で確認 2) 未コミットのローカル変更を `main` に反映（任意） 3) 休会・大会など追加拡張は `docs/member-services.md` のフェーズ2以降 |
| 主要ファイル | `index.html`（入会）、`plan-change.html`（プラン変更）、`leave-request.html`（退会）、`google-apps-script.js`（GAS 実体はスプレッドシート側） |

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
- [x] **プラン変更 / 休会希望** — `plan-change.html`、GAS の `formType: plan_change` ルート、シート「プラン変更」
- [x] **管理者向け通知メール** — 入会 / プラン変更・休会 / 退会の内容を `ccj.osaka@gmail.com` へ通知
- [x] **入会シートの列整列**（2026-06-12） — シートのヘッダーが旧 12 列のままで、新フォームの送信内容が右にずれていたのを是正。`シート1` を `入会` にリネームし、ヘッダーを 18 列（A:入会申込日 〜 R:備考）に統一、旧 3 行（井内 / 遠藤 / 菊池）も同じ列位置に並べ直し。GAS 側にも `ENROLLMENT_HEADERS_` と `ensureHeaders_` 呼び出しを追加し、ヘッダー欠落時は自己補完するようにした。

---

## デプロイ情報

| 項目 | 値 |
|------|-----|
| Apps Script URL | `https://script.google.com/macros/s/AKfycbxrVHm38s5AjyAVRdQEeIRBtjZAQ4tnCT2deRMDx0VC7XaiZtpkWoboaPlBIlnBDz3v4g/exec` |
| スプレッドシート名 | CCJカポエイラ入会申し込み |
| ローカルファイル | `index.html` / `plan-change.html`（同一 `SCRIPT_URL`） |
| 管理者通知先 | `ccj.osaka@gmail.com` |

**確認済み:**

- 2026-05-25: Apps Script の新バージョンをデプロイ、`plan-change` のテスト送信で `{"result":"success"}` を確認。
- 2026-06-12: clasp 経由で同 deploymentId に **@12（2026-06-12 入会タブ整列 + ヘッダー自己補完対応）** をデプロイ。`./scripts/deploy-enrollment-gas.sh` で `google-apps-script.js` → `Code.gs` 経由の自動 push & 既存ウェブアプリ更新が可能に。
- 2026-06-17: 管理者向け入会通知に初回費用ブロックを追加（お客さん向けと同じ `buildInitialPaymentGuide_`）。clasp **@13** で本番反映済み。

### ローカルから本番 GAS を更新する手順

1. `google-apps-script.js` を編集
2. `./scripts/deploy-enrollment-gas.sh` を実行（`scripts/deploy-enrollment-gas.conf` に `GAS_SCRIPT_ID` / `GAS_DEPLOYMENT_ID` が入っている前提）
3. 出力末尾の URL が変わっていないこと、`clasp list-deployments` で @バージョンが進んでいることを確認

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

### フォーム項目（送信される 18 キー / シート「入会」と同順）
入会申込日(自動) / コース / 氏名 / フリガナ / 生年月日 / 電話番号 / 予備電話番号 / メールアドレス / 予備メールアドレス / 郵便番号 / 住所1 / 住所2 / 保護者氏名 / 支払い方法 / 年会費規定同意 / 個人情報取扱同意 / 規約バージョン / 備考

### 機能
- コース選択で支払い方法が自動切替
- キッズクラス選択時は保護者氏名が必須に
- 郵便番号から住所自動入力
- 送信前の確認画面
- Google スプレッドシートへ自動保存
- 申し込み者に確認メール自動送信
- 管理者向けにフォーム内容をメール通知

---

## 公開URL

- 入会: https://ccjcapoeira.github.io/ccj-enrollment-form/
- プラン変更: https://ccjcapoeira.github.io/ccj-enrollment-form/plan-change.html

## メンバー手続きの拡張（設計）

プラン変更・休会・大会などを入会フォームと同じスタックで伸ばす方針は `docs/member-services.md` に記載。

## 今後の変更について

index.html を編集した後、以下のコマンドで更新を反映できます：
```
cd /Users/kuboyamatakeshi/GitHub/ccj-enrollment-form
git add .
git commit -m "変更内容のメモ"
git push
```

`google-apps-script.js` を変更した場合は、ローカル push に加えて **スプレッドシート側の Apps Script エディタで貼り替え → 「デプロイを管理」 → 既存ウェブアプリの「新バージョンをデプロイ」** が必要です（ファイル差し替えだけではウェブアプリには反映されません）。
