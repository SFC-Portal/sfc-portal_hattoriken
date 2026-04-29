#!/bin/bash

# === Git フックインストールスクリプト ===

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HOOKS_SOURCE="$SCRIPT_DIR/git-hooks"
HOOKS_DEST="$PROJECT_ROOT/.git/hooks"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Git フックをインストール"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# .git ディレクトリの確認
if [ ! -d "$PROJECT_ROOT/.git" ]; then
    echo "❌ .git ディレクトリが見つかりません"
    echo "   リポジトリのルートで実行してください"
    exit 1
fi

# フックをコピー
for hook in "$HOOKS_SOURCE"/*; do
    if [ -f "$hook" ]; then
        hook_name=$(basename "$hook")
        cp "$hook" "$HOOKS_DEST/$hook_name"
        chmod +x "$HOOKS_DEST/$hook_name"
        echo "✓ インストール: $hook_name"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  インストール完了"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "次回のコミットからフックが有効になります。"
echo ""
echo "フックをスキップする場合:"
echo "  git commit --no-verify"
echo ""
