# SFC Portal チーム開発ガイド

このガイドでは、チームメンバーが開発を始めるために必要な情報をまとめています。

---

## 目次

1. [初期セットアップ](#1-初期セットアップ)
2. [GitHub ワークフロー](#2-github-ワークフロー)
3. [開発の始め方](#3-開発の始め方)
4. [コード構成とファイル配置](#4-コード構成とファイル配置)
5. [コーディング規約](#5-コーディング規約)

---

## 1. 初期セットアップ

### 1.1 リポジトリのクローン

```bash
git clone <repository-url>
cd sfc-portal_hattoriken
```

### 1.2 環境構築

```bash
./scripts/setup.sh
```

このスクリプトが以下を自動実行します：

- 設定ファイルのコピー
- フロントエンド依存関係のインストール
- Python仮想環境の作成とバックエンド依存関係のインストール

### 1.3 環境変数の設定

セットアップ後、環境管理担当者から以下の値を受け取り、各ファイルに設定してください：

**`frontend/.env.local`**

| 変数名 | 内容 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000`（固定） |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key |

**`backend/.env`**

| 変数名 | 内容 |
|--------|------|
| `SUPABASE_URL` | Supabase Project URL（JWT検証用のJWKS取得にも使う） |
| `SUPABASE_KEY` | Secret key |
| `DATABASE_URL` | DB接続文字列。**Session Pooler**の接続文字列を使うこと（Supabaseダッシュボード「Connect」→「Session pooler」からコピー。直接接続用ホスト名は名前解決できないことがある） |
| `SECRET_KEY` | 任意のランダム文字列（現状未使用、将来のための予約） |
| `CORS_ORIGINS` | `["http://localhost:3000"]`（固定） |
| `DEBUG` | `true`（固定・ローカル開発時） |
| `GEMINI_API_KEY` | Gemini APIキー（AI細分化機能用） |
| `GEMINI_MODEL` | `gemma-4-31b-it`（固定） |

> **注意**: `.env` ファイルは絶対にgitにコミットしないでください。
> Google OAuthを使ったログインは、環境管理担当者がSupabase側で設定済みのため追加設定は不要です。

---

## 2. GitHub ワークフロー

### 2.1 ブランチ命名規則

**必ず新しいブランチを作成してから作業を開始してください。**

```text
{名前}/{機能}/{変更内容}
```

#### 例

| ブランチ名 | 説明 |
|-----------|------|
| `sota/tasks/add-create-form` | sotaがタスク機能に作成フォームを追加 |
| `yuki/syllabus/fix-search-bug` | yukiがシラバス検索のバグを修正 |
| `ken/sns/implement-post-api` | kenがSNS投稿APIを実装 |
| `mai/bus/update-timetable-ui` | maiがバス時刻表UIを更新 |

### 2.2 開発フロー

```text
1. mainブランチを最新化
       ↓
2. 新しいブランチを作成
       ↓
3. コードを書く
       ↓
4. コミット & プッシュ
       ↓
5. Pull Request を作成
       ↓
6. レビューを待つ（自分でマージしない）
       ↓
7. レビュー後、承認者がマージ
```

### 2.3 具体的なコマンド

#### ステップ1: mainを最新化

```bash
git checkout main
git pull origin main
```

#### ステップ2: ブランチを作成

```bash
git checkout -b sota/tasks/add-create-form
```

#### ステップ3: 作業してコミット

```bash
# 変更をステージング
git add frontend/src/components/tasks/TaskForm.tsx

# コミット（日本語でOK）
git commit -m "タスク作成フォームを追加"
```

#### ステップ4: プッシュ

```bash
git push -u origin sota/tasks/add-create-form
```

#### ステップ5: Pull Request を作成

1. GitHubのリポジトリページを開く
2. 「Compare & pull request」ボタンをクリック
3. 以下の情報を入力：

```markdown
## 概要
タスク作成フォームを実装しました。

## 変更内容
- TaskForm コンポーネントを追加
- createTask API を実装
- useTasks フックに作成機能を追加

## テスト方法
1. /tasks ページを開く
2. 「新規作成」ボタンをクリック
3. フォームに入力して送信
```

### 2.4 自動チェック（Pre-commit フック）

セットアップスクリプトにより、以下が自動でチェックされます：

| チェック項目 | 内容 |
|-------------|------|
| ブランチ名 | `{名前}/{機能}/{変更}` 形式かどうか |
| 機密ファイル | `.env` などがコミットに含まれていないか |
| ファイルサイズ | 5MB以上のファイルがないか |
| Lint | フロントエンドの変更時にESLintを実行 |

チェックに失敗するとコミットがブロックされます。

```bash
# フックをスキップする場合（非推奨）
git commit --no-verify
```

### 2.5 重要なルール

| ルール | 理由 |
|-------|------|
| **mainに直接コミットしない** | コードレビューを通すため |
| **自分のPRを自分でマージしない** | 別のメンバーの確認が必要 |
| **小さな単位でPRを作成** | レビューしやすくするため |
| **作業前にmainを最新化** | コンフリクトを防ぐため |

---

## 3. 開発の始め方

### 3.1 開発サーバーの起動・停止

#### 起動（推奨）

```bash
./scripts/start.sh
```

フロントエンドとバックエンドが同時に起動します。

| URL | 用途 |
|-----|------|
| http://localhost:3000 | フロントエンド |
| http://localhost:8000 | バックエンドAPI |
| http://localhost:8000/docs | API仕様書（Swagger） |

#### 停止

```bash
# 方法1: start.sh を起動したターミナルで
Ctrl+C

# 方法2: 別のターミナルから（方法1と等価）
./scripts/stop.sh
```

> **どちらを使うべきか**: 同じターミナル内なら Ctrl+C、ターミナルを閉じてしまった場合や Claude Code から操作する場合は `stop.sh` を使う。

### 3.2 ログインについて

`/tasks`・`/timetable`・`/sns` はGoogleログイン必須（Supabase Auth × Google OAuth）。ブラウザで `http://localhost:3000` を開き、これらのページにアクセスすると自動的に `/login` へリダイレクトされるので、「Googleでログイン」から自分のGoogleアカウントでログインすること。初回ログイン時はアカウント作成の確認画面が挟まる。

バックエンドAPIを`curl`等で直接叩く場合のみ、`backend/.env`の`DEBUG=true`によりAuthorizationヘッダ無しでも固定のダミーユーザーとして通る（フロントエンドの画面遷移では使えない、あくまでAPI単体テスト用）。

#### 方法B: 個別に起動

**ターミナル1（フロントエンド）:**

```bash
cd frontend
npm run dev
```

**ターミナル2（バックエンド）:**

```bash
cd backend
source venv/bin/activate  # 毎回必要
uvicorn app.main:app --reload
```

#### 方法C: Claude Code を使用

```bash
claude
```

プロンプト例：

```text
フロントエンドの開発サーバーを起動してください
```

### 3.3 AIを使った開発

#### Claude Code（推奨）

ターミナルで `claude` を実行すると、プロジェクトの設定を自動的に読み込みます。

```bash
claude
```

プロンプト例：

```text
TaskCardコンポーネントを作成してください：
- タスクのタイトル、期限、優先度を表示
- 完了チェックボックス付き
- 既存のパターンに従って
```

**コードレビューコマンド：**

```text
/simplify
```

このコマンドで、Claudeがコードをレビューして以下をチェックします：

- 不要なコード・重複コードの検出
- プロジェクト規約への準拠
- TypeScript型エラー
- セキュリティ問題

#### Gemini / ChatGPT

1. `AI_CODING_PROFILE.md` の内容をコピー
2. AIチャットに貼り付け
3. 「このプロファイルに従ってコードを生成してください」と伝える
4. 具体的な要件を指示

---

## 4. コード構成とファイル配置

### 4.1 ディレクトリ構造

```text
sfc-portal_hattoriken/
├── frontend/src/
│   ├── app/                    # ページ
│   │   └── [feature]/
│   │       └── page.tsx
│   ├── components/             # UIコンポーネント
│   │   └── [feature]/
│   │       ├── FeatureList.tsx
│   │       ├── FeatureCard.tsx
│   │       └── FeatureForm.tsx
│   ├── lib/
│   │   ├── api/                # APIクライアント
│   │   │   └── [feature].ts
│   │   ├── hooks/              # React Queryフック
│   │   │   └── use[Feature].ts
│   │   └── stores/             # Zustandストア
│   │       └── [feature].ts
│   └── types/                  # 型定義
│       └── [feature].ts
│
└── backend/app/
    ├── api/v1/endpoints/       # APIエンドポイント
    │   └── [feature].py
    ├── models/                 # ORMモデル
    │   └── [feature].py
    ├── schemas/                # Pydanticスキーマ
    │   └── [feature].py
    └── services/               # ビジネスロジック
        └── [feature]_service.py
```

### 4.2 新機能を追加する場合

例：「通知（notification）」機能を追加する場合

#### フロントエンド

| ファイル | 役割 |
|---------|------|
| `types/notification.ts` | 型定義 |
| `lib/api/notification.ts` | APIクライアント |
| `lib/hooks/useNotifications.ts` | データ取得・操作フック |
| `lib/stores/notification.ts` | クライアント状態（必要な場合） |
| `components/notifications/NotificationList.tsx` | 一覧コンポーネント |
| `components/notifications/NotificationItem.tsx` | 個別アイテム |
| `app/notifications/page.tsx` | ページ |

#### バックエンド

| ファイル | 役割 |
|---------|------|
| `models/notification.py` | データベースモデル |
| `schemas/notification.py` | リクエスト/レスポンススキーマ |
| `services/notification_service.py` | ビジネスロジック |
| `api/v1/endpoints/notification.py` | APIルート |

### 4.3 依存関係の流れ

```text
フロントエンド:
page.tsx → components/ → hooks/ → api/ → types/
                           ↓
                        stores/

バックエンド:
endpoints/ → services/ → models/ + schemas/
```

---

## 5. コーディング規約

### 5.1 命名規則

| 対象 | 形式 | 例 |
|-----|------|---|
| コンポーネント | PascalCase | `TaskCard.tsx` |
| フック | use + PascalCase | `useTasks.ts` |
| API関数 | 動詞 + 名詞 | `getTasks()`, `createTask()` |
| Pythonファイル | snake_case | `task_service.py` |
| ブランチ | 小文字 + スラッシュ | `sota/tasks/add-form` |

### 5.2 コメント形式

主要セクションのみコメントを記載：

```typescript
// === 型定義 ===
interface Task {
  id: string;
  title: string;
}

// === 状態管理 ===
const [tasks, setTasks] = useState<Task[]>([]);

// === イベントハンドラ ===
const handleSubmit = () => {
  // ...
};

// === レンダリング ===
return <div>...</div>;
```

### 5.3 インポート順序

```typescript
// 1. 外部ライブラリ
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. 内部モジュール（@/ エイリアス使用）
import { Button } from '@/components/ui/Button';
import { useTasks } from '@/lib/hooks/useTasks';
import type { Task } from '@/types/task';
```

### 5.4 重要なルール

| ルール | 詳細 |
|-------|------|
| UI文言は日本語 | ボタン、ラベル、メッセージなど |
| TypeScript strictモード | `any` は使用禁止 |
| コンポーネントは200行以内 | 超えたら分割する |
| `@/` パスエイリアス | 相対パスより優先 |

---

## クイックリファレンス

### よく使うコマンド

```bash
# ブランチ作成
git checkout -b {name}/{feature}/{change}

# 変更をコミット
git add .
git commit -m "変更内容"

# プッシュ
git push -u origin {branch-name}

# 開発サーバー起動（一括）
./scripts/start.sh

# 個別起動
cd frontend && npm run dev
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Claude Code 起動
claude
```

### 困ったときは

| 問題 | 解決策 |
|-----|-------|
| コンフリクトが発生 | `git pull origin main` してから手動解決 |
| 依存関係エラー | `npm install` または `pip install -r requirements.txt` |
| 型エラー | `npm run type-check` で詳細確認 |
| わからないこと | チームメンバーかClaude Codeに質問 |

---

**質問があればいつでもチームメンバーに聞いてください！**
