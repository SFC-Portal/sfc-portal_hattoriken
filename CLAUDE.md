# SFC Portal - Claude Code 設定

## 言語設定

**すべての出力は日本語で行うこと。**

## プロジェクト概要

慶應義塾大学SFC学生向け学生生活支援Webアプリ。

| レイヤー | 技術スタック                                                            |
| -------- | ----------------------------------------------------------------------- |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, React Query, Zustand |
| Backend  | FastAPI, SQLAlchemy, Pydantic v2                                        |
| Database | Supabase (PostgreSQL)                                                   |
| Auth     | Supabase Auth                                                           |

## チームセットアップ

### 新メンバー向け初期設定

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd sfc-portal_hattoriken

# 2. セットアップスクリプトを実行
./scripts/setup.sh
```

セットアップスクリプトが自動で以下を実行：

- ローカル設定ファイルのコピー
- フロントエンド依存関係のインストール
- Python仮想環境の作成とバックエンド依存関係のインストール

### 必須VS Code拡張機能

```json
// .vscode/extensions.json に設定済み
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-python.python",
    "ms-python.vscode-pylance"
  ]
}
```

## .gitignore ルール

チーム全員が同じ構成になるよう、以下のルールを遵守すること：

```gitignore
# === Node.js ===
node_modules/
.next/
out/
dist/
*.tsbuildinfo

# === Python ===
__pycache__/
*.py[cod]
*.egg-info/
.venv/
venv/

# === 環境変数（機密情報） ===
.env
*.env
.env.local
.env.production
!.env.local.example    # テンプレートは追跡
!.env.example

# === OS ===
.DS_Store
Thumbs.db

# === エディタ ===
.vscode/settings.json  # 個人設定は除外
.idea/

# === Supabase ===
supabase/.branches/
supabase/.temp/

# === Claude Code（個人設定は除外） ===
.claude/settings.local.json
CLAUDE.local.md
```

**重要**: 新規ファイル追加時は上記カテゴリに従って.gitignoreを更新すること。

## コマンド

```bash
# === 開発サーバー ===
./scripts/start.sh          # フロント・バック同時起動
./scripts/stop.sh           # 別ターミナルから停止（Ctrl+C でも可）

# フロントエンド個別
cd frontend && npm run dev    # 開発サーバー
cd frontend && npm run build  # 本番ビルド
cd frontend && npm run lint   # Lint

# バックエンド個別（venv有効化が必要）
cd backend && source venv/bin/activate
uvicorn app.main:app --reload
```

> **Ctrl+C vs stop.sh**: `start.sh` を起動したターミナルで Ctrl+C を押すのと `stop.sh` を実行するのは等価。ターミナルを閉じた場合や別セッションから止めたいときは `stop.sh` を使う。

## アーキテクチャ

```text
frontend/src/
├── app/[feature]/page.tsx    # ページ
├── components/[feature]/     # UIコンポーネント
├── lib/api/[feature].ts      # APIクライアント
├── lib/hooks/use[Feature].ts # React Queryフック
├── lib/stores/[feature].ts   # Zustandストア
└── types/[feature].ts        # 型定義

backend/app/
├── api/v1/endpoints/[feature].py  # ルート
├── models/[feature].py            # ORMモデル
├── schemas/[feature].py           # Pydanticスキーマ
└── services/[feature]_service.py  # ビジネスロジック
```

## コード規約

### 依存関係フロー

```text
page.tsx → components/ → hooks/ → api/ → types/
                           ↓
                        stores/
```

### コメント形式

```typescript
// === セクション名 ===
```

### 命名規則

| 対象           | 形式             | 例             |
| -------------- | ---------------- | -------------- |
| コンポーネント | PascalCase       | `TaskCard.tsx` |
| フック         | use + PascalCase | `useTasks.ts`  |
| API関数        | 動詞 + 名詞      | `getTasks`     |
| ストア         | 名詞 + Store     | `taskStore.ts` |

### スタイル

- TypeScript strictモード必須
- `@/` パスエイリアス使用
- コンポーネントは200行以内
- Tailwind CSS + `sfc-blue`, `sfc-lightBlue`

## 重要な規則

- **UI文言**: 日本語
- **APIパス**: `/api/v1/` プレフィックス
- **認証**: Supabase Auth
- **状態管理**: サーバー=React Query、クライアント=Zustand

## 機能モジュール

| 機能     | パス         | 状態                              |
| -------- | ------------ | --------------------------------- |
| シラバス | `/syllabus`  | スタブ                            |
| 時間割   | `/timetable` | スタブ                            |
| タスク   | `/tasks`     | 実装済み（PR #7）、AI細分化は未実装 |
| SNS      | `/sns`       | スタブ                            |
| バス     | `/bus`       | スタブ                            |

### DBスキーマ変更時の注意

このプロジェクトはAlembicによる自動マイグレーションを使用していない。`models/` を変更した場合は、対応するSQLをSupabase SQL Editorで手動実行すること。実施済みのマイグレーション：

```sql
-- tasksテーブルにサブタスク・開始日カラムを追加（実施済み）
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_id VARCHAR REFERENCES tasks(id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON tasks(parent_id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
```

## カスタムコマンド

- `/simplify` — コードレビュー＆簡素化（`.claude/commands/simplify.md`）

## 参照

- `docs/TEAM_GUIDE.md` — チーム開発ガイド（GitHub・コード規約）
- `.claude/docs/claude-usage-guide.md` — Claude利用ガイド
- `AI_CODING_PROFILE.md` — Gemini/ChatGPT用プロファイル
- `README.md` — セットアップ手順
