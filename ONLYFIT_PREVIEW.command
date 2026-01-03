#!/bin/zsh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_ROOT"

"$REPO_ROOT/scripts/preview.sh"
