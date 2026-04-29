# GitHub リポジトリ設定ガイド

このドキュメントでは、SFC Portalリポジトリの推奨設定を説明します。

---

## 1. ブランチ保護ルール

**Settings → Branches → Add branch protection rule**

### main ブランチの保護設定

| 設定 | 推奨値 | 説明 |
|-----|-------|------|
| Branch name pattern | `main` | 保護するブランチ |
| Require a pull request before merging | ✅ ON | PRなしのマージを禁止 |
| Require approvals | ✅ ON (1人以上) | レビュー承認を必須化 |
| Dismiss stale pull request approvals | ✅ ON | 新しいコミット時に承認をリセット |
| Require review from Code Owners | ✅ ON | CODEOWNERSのレビューを必須化 |
| Require status checks to pass | ✅ ON | CI/CDチェックを必須化 |
| Require branches to be up to date | ✅ ON | mainとの同期を必須化 |
| Include administrators | ✅ ON | 管理者にもルールを適用 |
| Restrict who can push | ✅ ON | 直接プッシュを制限 |
| Allow force pushes | ❌ OFF | 強制プッシュを禁止 |
| Allow deletions | ❌ OFF | ブランチ削除を禁止 |

---

## 2. コラボレーター権限

**Settings → Collaborators and teams**

### 権限レベル

| 権限 | できること | 対象者 |
|-----|----------|-------|
| **Admin** | すべての操作（設定変更、マージ権限付与） | リーダー |
| **Maintain** | PRマージ、ブランチ管理（設定変更は不可） | コアメンバー |
| **Write** | コードプッシュ、PR作成（マージは不可） | 開発メンバー |
| **Read** | コードの閲覧のみ | 外部メンバー |

### 推奨構成

```
Admin (1-2人)
├── リポジトリ設定の管理
├── ブランチ保護ルールの設定
└── 最終マージ権限

Maintain (2-3人)
├── PRレビュー & マージ
├── Issueの管理
└── リリース管理

Write (その他のメンバー)
├── 機能開発
├── PR作成
└── コードレビュー（承認権限なし）
```

---

## 3. GitHub Actions（CI/CD）

**推奨ワークフロー:**

### PR時の自動チェック

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: cd frontend && npm ci && npm run lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: cd frontend && npm ci && npm run type-check
```

---

## 4. その他の推奨設定

### General Settings

| 設定 | 推奨値 |
|-----|-------|
| Default branch | `main` |
| Allow merge commits | ❌ OFF |
| Allow squash merging | ✅ ON（推奨） |
| Allow rebase merging | ❌ OFF |
| Automatically delete head branches | ✅ ON |

### Pull Requests

| 設定 | 推奨値 |
|-----|-------|
| Allow auto-merge | ✅ ON |
| Require contributors to sign off | ❌ OFF |

### Issues

| 設定 | 推奨値 |
|-----|-------|
| Issues | ✅ ON |
| Labels | バグ、機能追加、ドキュメント、質問 等を追加 |

---

## 5. セットアップ手順

1. **リポジトリ作成後、Settings を開く**

2. **Collaborators を追加**
   - Settings → Collaborators and teams
   - メンバーを追加して権限を設定

3. **ブランチ保護を設定**
   - Settings → Branches → Add rule
   - 上記の設定を適用

4. **CODEOWNERS を確認**
   - `.github/CODEOWNERS` のユーザー名を更新

5. **GitHub Actions を有効化**（必要に応じて）
   - `.github/workflows/ci.yml` を追加

---

## クイックリファレンス

### マージできる人

- Admin 権限を持つユーザー
- Maintain 権限を持つユーザー
- CODEOWNERS に指定されたユーザー

### PRが必要な条件

- mainブランチへのすべての変更
- 最低1人のレビュー承認
- すべてのステータスチェックに合格

### マージ方法

- **Squash and merge**（推奨）— コミットを1つにまとめる
