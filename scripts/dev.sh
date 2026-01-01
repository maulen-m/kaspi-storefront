#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if ! command -v pnpm >/dev/null 2>&1; then
  corepack enable || true
fi

if [ ! -d node_modules ]; then
  pnpm install
fi

pnpm dev
