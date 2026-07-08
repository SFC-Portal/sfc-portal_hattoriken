#!/bin/bash

# === SFC Portal 開発サーバー停止スクリプト ===
# 使用方法: ./scripts/stop.sh

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo ""
echo -e "${YELLOW}SFC Portal サーバーを停止中...${NC}"

pkill -f "uvicorn app.main:app" 2>/dev/null && echo -e "  ${GREEN}✓${NC} バックエンド停止" || echo "  バックエンドは起動していません"
pkill -f "next dev" 2>/dev/null && echo -e "  ${GREEN}✓${NC} フロントエンド停止" || echo "  フロントエンドは起動していません"

echo ""
