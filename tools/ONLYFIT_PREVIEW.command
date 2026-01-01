#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

if ! command -v pnpm >/dev/null 2>&1; then
  corepack enable || true
fi

if [ ! -d node_modules ]; then
  pnpm install
fi

pnpm build
pnpm preview
