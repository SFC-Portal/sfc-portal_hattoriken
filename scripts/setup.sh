#!/bin/bash

# === SFC Portal 初期セットアップスクリプト ===
# 使用方法: ./scripts/setup.sh

set -e

# 色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# プロジェクトルートに移動
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  SFC Portal - 開発環境セットアップ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# === 1. 設定ファイルのコピー ===
print_step "設定ファイルをコピー中..."

copy_if_not_exists() {
    local src=$1
    local dest=$2
    if [ ! -f "$dest" ]; then
        if [ -f "$src" ]; then
            cp "$src" "$dest"
            print_success "作成: $dest"
        else
            print_warning "テンプレートが見つかりません: $src"
        fi
    else
        print_warning "スキップ（既存）: $dest"
    fi
}

copy_if_not_exists "CLAUDE.local.md.example" "CLAUDE.local.md"
copy_if_not_exists ".claude/settings.local.json.example" ".claude/settings.local.json"
copy_if_not_exists "frontend/.env.local.example" "frontend/.env.local"
copy_if_not_exists "backend/.env.example" "backend/.env"

echo ""

# === 2. フロントエンド依存関係 ===
print_step "フロントエンド依存関係をインストール中..."

if command -v npm &> /dev/null; then
    cd "$PROJECT_ROOT/frontend"
    npm install --silent
    print_success "フロントエンド依存関係をインストールしました"
    cd "$PROJECT_ROOT"
else
    print_error "npmが見つかりません。Node.jsをインストールしてください"
    exit 1
fi

echo ""

# === 3. バックエンド依存関係 ===
print_step "バックエンド依存関係をインストール中..."

cd "$PROJECT_ROOT/backend"

if command -v python3 &> /dev/null; then
    # 仮想環境を作成（存在しない場合）
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "Python仮想環境を作成しました"
    else
        print_warning "仮想環境は既に存在します"
    fi

    # 依存関係をインストール
    source venv/bin/activate
    pip install -r requirements.txt --quiet
    deactivate
    print_success "バックエンド依存関係をインストールしました"
else
    print_error "python3が見つかりません。Pythonをインストールしてください"
    exit 1
fi

cd "$PROJECT_ROOT"

echo ""

# === 4. Git フックをインストール ===
print_step "Git フックをインストール中..."

if [ -d "$PROJECT_ROOT/.git" ]; then
    HOOKS_SOURCE="$PROJECT_ROOT/scripts/git-hooks"
    HOOKS_DEST="$PROJECT_ROOT/.git/hooks"

    for hook in "$HOOKS_SOURCE"/*; do
        if [ -f "$hook" ]; then
            hook_name=$(basename "$hook")
            cp "$hook" "$HOOKS_DEST/$hook_name"
            chmod +x "$HOOKS_DEST/$hook_name"
        fi
    done
    print_success "Git フックをインストールしました（pre-commit）"
else
    print_warning ".git ディレクトリが見つかりません"
fi

echo ""

# === 5. VS Code拡張機能の確認 ===
print_step "VS Code拡張機能を確認中..."

if command -v code &> /dev/null; then
    print_success "VS Codeを検出しました"
    echo "  推奨拡張機能は .vscode/extensions.json に定義されています"
    echo "  VS Codeで開くと自動的にインストールを促されます"
else
    print_warning "VS Codeコマンドが見つかりません（オプション）"
fi

echo ""

# === 完了 ===
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  セットアップ完了！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "次のステップ:"
echo ""
echo "  1. 環境変数を設定:"
echo "     - frontend/.env.local"
echo "     - backend/.env"
echo ""
echo "  2. 開発サーバーを起動:"
echo "     フロントエンド: cd frontend && npm run dev"
echo "     バックエンド:   cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo ""
echo "  3. Claude Codeを使用（オプション）:"
echo "     claude"
echo ""
