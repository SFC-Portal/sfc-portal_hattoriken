# SFC Portal - 服部研

慶應義塾大学SFC（湘南藤沢キャンパス）の学生生活を支援するWebアプリケーション。

## 機能

- **シラバス検索** — キーワード・教員名・曜日・時限などで授業を検索
- **時間割管理** — 履修登録した科目を時間割形式で表示
- **タスク管理** — 課題・締め切りの管理
- **SNS** — 学生間のコミュニケーション
- **バス時刻表** — キャンパス発着バスの時刻確認

## 技術スタック

| レイヤー | 技術 |
|---------|-----|
| フロントエンド | Next.js 14, TypeScript, Tailwind CSS, React Query |
| バックエンド | FastAPI, Python 3.11, SQLAlchemy 2, Pydantic v2 |
| データベース | Supabase (PostgreSQL) |
| 認証 | Supabase Auth |
| デプロイ | Vercel (フロント), Supabase (DB) |

## セットアップ

### 必要環境

- Node.js 18+
- Python 3.11+（3.13動作確認済み）

### クイックスタート

```bash
git clone <repository-url>
cd sfc-portal_hattoriken
./scripts/setup.sh
```

セットアップスクリプトが以下を自動実行：

- 設定ファイルのコピー（`.env.local`, `.env` 等）
- フロントエンド依存関係のインストール
- Python仮想環境の作成とバックエンド依存関係のインストール

### 手動セットアップ

<details>
<summary>手動で設定する場合はこちら</summary>

#### フロントエンド

```bash
cd frontend
cp .env.local.example .env.local  # 環境変数を設定
npm install
npm run dev  # http://localhost:3000
```

#### バックエンド

```bash
cd backend
cp .env.example .env  # 環境変数を設定
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload  # http://localhost:8000
```

</details>

### Supabase

このプロジェクトはSupabase cloudを使用しています（Dockerなし）。

環境変数（`frontend/.env.local` と `backend/.env`）に設定するURLとキーは、環境管理担当者から受け取ってください。

## ディレクトリ構造

```text
sfc-portal_hattoriken/
├── frontend/          # Next.js アプリケーション
│   └── src/
│       ├── app/           # ページ (App Router)
│       ├── components/    # UIコンポーネント
│       ├── lib/           # API・フック・ストア・ユーティリティ
│       └── types/         # TypeScript型定義
│
├── backend/           # FastAPI アプリケーション
│   └── app/
│       ├── api/v1/        # APIルート
│       ├── models/        # ORMモデル
│       ├── schemas/       # Pydanticスキーマ
│       └── services/      # ビジネスロジック
│
└── supabase/          # データベース
    └── migrations/        # マイグレーションファイル
```

## 開発ガイド

### コマンド一覧

```bash
# フロントエンド
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm run lint         # ESLint実行
npm run type-check   # TypeScript型チェック

# バックエンド
uvicorn app.main:app --reload  # 開発サーバー起動
pytest                         # テスト実行
```

### チーム開発

**[docs/TEAM_GUIDE.md](docs/TEAM_GUIDE.md)** を必ず読んでください。

- GitHubワークフロー（ブランチ命名、PR作成）
- 開発の始め方（サーバー起動、AI活用）
- コード構成とファイル配置

### AIアシスタントとの開発

- **Claude Code**: `claude` コマンドで起動（`CLAUDE.md` を自動読み込み）
- **Gemini/ChatGPT**: `AI_CODING_PROFILE.md` を貼り付けて使用

## ライセンス

MIT License
