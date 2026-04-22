# SFC Portal - Hattoriken

SFCの学生生活を支援するWebアプリケーション。シラバス検索をはじめ、様々な機能を提供します。

## Architecture

```
sfc-portal_hattoriken/
├── frontend/        # Next.js 14 (App Router, TypeScript) — Vercel
├── backend/         # FastAPI (Python 3.11+)              — Vercel / Railway
└── supabase/        # DB migrations & seed data           — Supabase
```

## Tech Stack

| Layer     | Technology                                          |
|-----------|-----------------------------------------------------|
| Frontend  | Next.js 14, TypeScript, Tailwind CSS, React Query   |
| Backend   | FastAPI, Python 3.11, SQLAlchemy 2, Pydantic v2     |
| Database  | Supabase (PostgreSQL)                               |
| Auth      | Supabase Auth                                       |
| Deploy    | Vercel (frontend + backend functions), Supabase (DB)|

## Features

- 🔍 **シラバス検索** — キーワード・教員名・曜日・時限などで授業を検索
- 📅 **時間割管理** — 履修登録した科目を時間割形式で表示
- 🗺️ **キャンパスマップ** — 教室・施設の案内
- 📢 **お知らせ** — SFC関連のお知らせ集約
- 🍽️ **食堂メニュー** — 当日の食堂メニュー

## Getting Started

```bash
# Frontend
cd frontend
cp .env.local.example .env.local
npm install && npm run dev

# Backend
cd backend
cp .env.example .env
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Supabase local
supabase start
supabase db push
```

## Monorepo Structure

```
frontend/src/
  app/           # Next.js App Router pages
  components/    # UI コンポーネント
  lib/           # API クライアント・Supabase ヘルパー
  hooks/         # カスタム React hooks
  types/         # TypeScript 型定義

backend/app/
  api/v1/        # FastAPI ルーター
  core/          # 設定・セキュリティ
  models/        # SQLAlchemy ORM モデル
  schemas/       # Pydantic スキーマ
  services/      # ビジネスロジック
  db/            # DB セッション

supabase/
  migrations/    # SQL マイグレーションファイル
```
