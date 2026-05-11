# GitHub Pages URLを ccjcapoeira に変更する手順

この手順書は、現在の公開URL

`https://soquetecapoeira-max.github.io/ccj-enrollment-form/`

を、次のURLへ変更するための作業メモです。

`https://ccjcapoeira.github.io/ccj-enrollment-form/`

## 1. ccjcapoeira アカウントを作成する

1. GitHubにログインする。
2. 右上のプロフィールアイコンから、必要に応じて現在のアカウントを確認する。
3. `ccjcapoeira` を新しいユーザーアカウント、またはOrganizationとして作成する。
   - 個人ではなく団体運用にしたい場合は、Organizationがおすすめです。
   - Organizationにすると、後から管理者や共同編集者を追加しやすくなります。
4. 作成後、ブラウザで次のページが開けることを確認する。

`https://github.com/ccjcapoeira`

## 2. 現在のリポジトリを移管する

現在のリポジトリ:

`https://github.com/soquetecapoeira-max/ccj-enrollment-form`

移管後のリポジトリ:

`https://github.com/ccjcapoeira/ccj-enrollment-form`

手順:

1. GitHubで現在のリポジトリを開く。
2. `Settings` を開く。
3. 左メニューの一番下付近にある `Danger Zone` を確認する。
4. `Transfer ownership` を選ぶ。
5. 移管先に `ccjcapoeira` を入力する。
6. GitHubの案内に従って、リポジトリ名 `ccj-enrollment-form` を入力して確定する。
7. Organizationへ移管する場合は、`ccjcapoeira` 側で承認が必要になることがあります。

## 3. GitHub Pages の公開状態を確認する

移管後、次を確認します。

1. `https://github.com/ccjcapoeira/ccj-enrollment-form` を開く。
2. `Settings` → `Pages` を開く。
3. Sourceが次の状態になっているか確認する。
   - Branch: `main`
   - Folder: `/`
4. 公開URLが次になっているか確認する。

`https://ccjcapoeira.github.io/ccj-enrollment-form/`

反映には数分かかることがあります。

## 4. ローカルリポジトリの接続先を変更する

移管が完了したら、ローカルで次を実行します。

```bash
git remote set-url origin https://github.com/ccjcapoeira/ccj-enrollment-form.git
git remote -v
```

`git remote -v` の結果が次のようになればOKです。

```text
origin  https://github.com/ccjcapoeira/ccj-enrollment-form.git (fetch)
origin  https://github.com/ccjcapoeira/ccj-enrollment-form.git (push)
```

## 5. 公開ページを確認する

以下のURLをブラウザで確認します。

- 入会: `https://ccjcapoeira.github.io/ccj-enrollment-form/`
- プラン変更: `https://ccjcapoeira.github.io/ccj-enrollment-form/plan-change.html`
- 退会のお手続き: `https://ccjcapoeira.github.io/ccj-enrollment-form/leave-request.html`
- 入会規約: `https://ccjcapoeira.github.io/ccj-enrollment-form/terms-adult.html`

確認ポイント:

- ページが404にならない
- 入会フォームから規約ページを開ける
- フッターからプラン変更・退会フォームへ移動できる
- 住所検索が動く
- フォーム送信先のGoogle Apps Script URLが変わっていない

## 6. 変更後に再チェックする項目

リポジトリ内では、現在のフォーム本体は相対リンク中心です。そのため、GitHub Pagesのユーザー名が変わっても、ページ間リンクは基本的に壊れません。

確認が必要なもの:

- GitHub Pagesの公開URL
- READMEや運用メモ内のURL表記
- ローカルの `origin` URL
- 外部に共有済みの旧URL
- SNS、LINE、Webサイト、QRコードなどに掲載している旧URL

## 7. 旧URLについて

GitHubのリポジトリ移管後、旧URLから新URLへ自動リダイレクトされる場合があります。ただし、GitHub PagesのURLは恒久的なリダイレクト保証が弱いため、外部に掲載しているリンクは新URLへ更新してください。

旧URL:

`https://soquetecapoeira-max.github.io/ccj-enrollment-form/`

新URL:

`https://ccjcapoeira.github.io/ccj-enrollment-form/`

## 8. 作業完了後の最終確認

最後に次を確認します。

```bash
git status
git remote -v
```

必要に応じて、古い所有者名が残っていないか検索します。

```bash
rg "soquetecapoeira-max|soqueteacapoeira-max"
```

検索結果が出なければ、リポジトリ内のURL表記は更新済みです。
