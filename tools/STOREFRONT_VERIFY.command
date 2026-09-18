#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

"$REPO_ROOT/scripts/verify.sh"

echo ""
echo "✅ verify finished"
read -k1 "?Press any key to close..."
