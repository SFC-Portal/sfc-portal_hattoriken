# SFC Portal - AI コーディングプロファイル

Gemini、ChatGPT、その他のAIアシスタント用。このファイルをコンテキストとして貼り付けて使用。

---

## 基本設定

- **言語**: すべての出力は日本語
- **プロジェクト**: 慶應義塾大学SFC学生向け学生生活支援Webアプリ

## 技術スタック

| レイヤー | 技術 |
|---------|-----|
| フロントエンド | Next.js 14 (App Router), TypeScript (strict), Tailwind CSS, React Query, Zustand |
| バックエンド | FastAPI, Python 3.11+（3.13動作確認済み）, SQLAlchemy 2（同期）, Pydantic v2 |
| データベース | Supabase (PostgreSQL) |
| 認証 | Supabase Auth |

## ディレクトリ構造

```text
frontend/src/
├── app/[feature]/page.tsx        # ページ
├── components/[feature]/         # UIコンポーネント
├── lib/api/[feature].ts          # APIクライアント
├── lib/hooks/use[Feature].ts     # React Queryフック
├── lib/stores/[feature].ts       # Zustandストア
└── types/[feature].ts            # 型定義

backend/app/
├── api/v1/endpoints/[feature].py # ルート
├── models/[feature].py           # ORMモデル
├── schemas/[feature].py          # Pydanticスキーマ
└── services/[feature]_service.py # ビジネスロジック
```

## コード生成ルール

### 1. 依存関係フロー

```text
page.tsx → components/ → hooks/ → api/ → types/
                           ↓
                        stores/
```

### 2. コメント形式

```typescript
// === セクション名 ===
```

### 3. 命名規則

| 対象 | 形式 | 例 |
|-----|------|---|
| コンポーネント | PascalCase | `TaskCard.tsx` |
| フック | use + PascalCase | `useTasks.ts` |
| API関数 | 動詞 + 名詞 | `getTasks()` |
| Pythonファイル | snake_case | `task_service.py` |

### 4. インポート順序

```typescript
// 1. 外部ライブラリ
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. 内部モジュール（@/エイリアス）
import { Button } from '@/components/ui/Button';
import type { Task } from '@/types/task';
```

### 5. コンポーネントテンプレート

```typescript
'use client';

import { useState } from 'react';
import type { Task } from '@/types/task';

// === 型定義 ===
interface Props {
  initialData?: Task[];
}

// === コンポーネント ===
export function TaskList({ initialData }: Props) {
  // === 状態管理 ===
  const [filter, setFilter] = useState('');

  // === イベントハンドラ ===
  const handleChange = (value: string) => setFilter(value);

  // === レンダリング ===
  return <div className="space-y-4">...</div>;
}
```

### 6. APIクライアントテンプレート

```typescript
import { apiClient } from './client';
import type { Task, CreateTaskInput } from '@/types/task';

const BASE_URL = '/api/v1/tasks';

export async function getTasks(): Promise<Task[]> {
  const response = await apiClient.get(BASE_URL);
  return response.data;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await apiClient.post(BASE_URL, input);
  return response.data;
}
```

### 7. FastAPIエンドポイントテンプレート

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.task import TaskCreate, TaskResponse
from app.services.task_service import TaskService

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("", response_model=list[TaskResponse])
async def get_tasks(db: Session = Depends(get_db)):
    """タスク一覧を取得"""
    service = TaskService(db)
    return await service.get_all()

@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(data: TaskCreate, db: Session = Depends(get_db)):
    """新規タスクを作成"""
    service = TaskService(db)
    return await service.create(data)
```

## スタイリング

- Tailwind CSS使用
- SFCブランドカラー: `sfc-blue`, `sfc-lightBlue`
- レスポンシブ対応必須（mobile-first）

## 重要な規則

1. **UI文言は日本語**
2. **TypeScript strictモード** — any禁止
3. **200行以内** — 超えたら分割
4. **エラーハンドリング** — try-catch必須
5. **アクセシビリティ** — aria属性対応

## 機能モジュール

| 機能 | フロント | バックエンド |
|-----|---------|------------|
| シラバス | `/syllabus` | `/api/v1/syllabus` |
| 時間割 | `/timetable` | `/api/v1/timetable` |
| タスク | `/tasks` | `/api/v1/tasks` |
| SNS | `/sns` | `/api/v1/sns` |
| バス | `/bus` | `/api/v1/bus` |

---

## .gitignore ルール

新規ファイル追加時は以下のカテゴリに従うこと：

```gitignore
# === Node.js ===
node_modules/
.next/
dist/

# === Python ===
__pycache__/
*.py[cod]
.venv/
venv/

# === 環境変数 ===
.env
*.env
.env.local
!.env.example        # テンプレートは追跡

# === OS ===
.DS_Store
Thumbs.db

# === エディタ ===
.vscode/settings.json
.idea/

# === Supabase ===
supabase/.branches/
supabase/.temp/

# === Claude Code ===
.claude/settings.local.json
CLAUDE.local.md
```

---

## セットアップ

```bash
# 初回
git clone <repository-url>
cd sfc-portal_hattoriken
./scripts/setup.sh
# frontend/.env.local と backend/.env に環境変数を設定（担当者から取得）

# 2回目以降
./scripts/dev.sh
```

---

## 使い方

1. このファイルをコピー
2. AIチャット（Gemini/ChatGPT）に貼り付け
3. 「このプロファイルに従ってコードを生成してください」と伝える
4. 具体的な要件を指示

### プロンプト例

```text
上記のプロファイルに従って、TaskCardコンポーネントを作成してください：
- タスクのタイトル、期限、優先度を表示
- 完了チェックボックス付き
- 削除ボタン付き
```
