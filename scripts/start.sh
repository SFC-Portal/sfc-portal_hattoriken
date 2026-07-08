#!/bin/bash

# === SFC Portal 開発サーバー起動スクリプト ===
# 使用方法: ./scripts/start.sh
# 停止方法: Ctrl+C（このターミナル内） または別ターミナルから ./scripts/stop.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Ctrl+C で両プロセスを停止
cleanup() {
    echo ""
    echo -e "${YELLOW}サーバーを停止中...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}
trap cleanup INT TERM

# venv確認
if [ ! -f "$PROJECT_ROOT/backend/venv/bin/uvicorn" ]; then
    echo -e "${YELLOW}venvが見つかりません。先に ./scripts/setup.sh を実行してください。${NC}"
    exit 1
fi

# .env確認
if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    echo -e "${YELLOW}backend/.env が見つかりません。環境変数を設定してください。${NC}"
    exit 1
fi

if [ ! -f "$PROJECT_ROOT/frontend/.env.local" ]; then
    echo -e "${YELLOW}frontend/.env.local が見つかりません。環境変数を設定してください。${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  SFC Portal - 開発サーバー起動${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# バックエンド起動
cd "$PROJECT_ROOT/backend"
"$PROJECT_ROOT/backend/venv/bin/uvicorn" app.main:app --reload 2>&1 | sed "s/^/$(echo -e "${BLUE}[backend]${NC}") /" &

# フロントエンド起動
cd "$PROJECT_ROOT/frontend"
npm run dev 2>&1 | sed "s/^/$(echo -e "${GREEN}[frontend]${NC}") /" &

echo -e "  フロントエンド: ${GREEN}http://localhost:3000${NC}"
echo -e "  バックエンドAPI: ${BLUE}http://localhost:8000${NC}"
echo -e "  API仕様書:      ${BLUE}http://localhost:8000/docs${NC}"
echo ""
echo -e "  ${YELLOW}Ctrl+C で両方停止${NC}"
echo ""

wait
