#!/usr/bin/env bash
set -euo pipefail

# scripts/oracle_pack.sh
# Generate an Oracle context pack deterministically from git signals (no API usage required).
#
# Usage:
#   scripts/oracle_pack.sh --task TASK-268 --range HEAD~1..HEAD
#   scripts/oracle_pack.sh --task TASK-312 --range HEAD~3..HEAD --cmd "pnpm verify"
#
# Output:
#   ~/Docs/Oracle/acmewear_web/<YYYY-MM-DD>/<HHMMSS>_<task>.md

TASK=""
RANGE="HEAD~1..HEAD"
OUT_ROOT="~/Docs/Oracle"
PROJECT="acmewear_web"
MAX_BYTES="300000"
ALLOW_DIRTY="false"
PROMPT_TEMPLATE="review"
CMDS=()

usage() {
  cat <<'EOF'
Usage:
  scripts/oracle_pack.sh --task <NAME> [--range <A..B>] [--out-root <DIR>] [--project <NAME>]
                         [--max-bytes <N>] [--allow-dirty] [--prompt <review|debug|plan>]
                         [--cmd "<command you ran>"]...

Examples:
  scripts/oracle_pack.sh --task TASK-268 --range HEAD~1..HEAD
  scripts/oracle_pack.sh --task TASK-312 --range HEAD~3..HEAD --cmd "pnpm verify"

Notes:
- Default requires clean git status. Use --allow-dirty to pack working tree changes (less reproducible).
- No API calls are made; this uses oracle --render and writes the bundle to disk.
EOF
}

die() { echo "ERROR: $*" >&2; exit 1; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --task) TASK="${2:-}"; shift 2;;
    --range) RANGE="${2:-}"; shift 2;;
    --out-root) OUT_ROOT="${2:-}"; shift 2;;
    --project) PROJECT="${2:-}"; shift 2;;
    --max-bytes) MAX_BYTES="${2:-}"; shift 2;;
    --allow-dirty) ALLOW_DIRTY="true"; shift 1;;
    --prompt) PROMPT_TEMPLATE="${2:-review}"; shift 2;;
    --cmd) CMDS+=("${2:-}"); shift 2;;
    -h|--help) usage; exit 0;;
    *) die "Unknown arg: $1";;
  esac
done

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || die "Not a git repo"
cd "$ROOT"

BRANCH="$(git branch --show-current || true)"
if [[ -z "$BRANCH" ]]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
fi
HEAD_SHA="$(git rev-parse --short HEAD)"
NOW_DATE="$(date +%F)"
NOW_TIME="$(date +%H%M%S)"

OUT_DIR="${OUT_ROOT}/${PROJECT}/${NOW_DATE}"
mkdir -p "$OUT_DIR"

if [[ -z "$TASK" ]]; then
  if [[ "$BRANCH" =~ ^task/(TASK-[0-9]+) ]]; then
    TASK="${BASH_REMATCH[1]}"
  fi
fi

if [[ -z "$TASK" ]]; then
  die "Pass --task (e.g., TASK-268)."
fi

OUT_FILE="${OUT_DIR}/${NOW_TIME}_${TASK}.md"

PYTHON_BIN="python3"
if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  PYTHON_BIN="python"
fi
command -v "$PYTHON_BIN" >/dev/null 2>&1 || die "python3 or python is required"

# Clean working tree checkpoint
if [[ "$ALLOW_DIRTY" != "true" ]]; then
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "Repo is dirty. Refusing to generate pack for RANGE=${RANGE} because it is not reproducible."
    echo "Fix: commit/stash changes OR rerun with --allow-dirty."
    exit 2
  fi
fi

# Determine oracle CLI
ORACLE_LOCAL="~/Docs/steipete/oracle-main/dist/bin/oracle-cli.js"
if [[ -x "$ORACLE_LOCAL" ]]; then
  ORACLE_CMD=(node "$ORACLE_LOCAL")
else
  ORACLE_CMD=(npx -y @steipete/oracle)
fi

TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/oracle_pack_${TASK}_${NOW_TIME}_XXXX")"
trap 'rm -rf "$TMP_DIR"' EXIT

META_FILE="${TMP_DIR}/0_META.md"
DIFF_FILE="${TMP_DIR}/0_DIFF.md"

# Collect changed files (from range or working tree)
CHANGED_FILES=()
if [[ "$ALLOW_DIRTY" == "true" ]]; then
  while IFS= read -r line; do
    [[ -n "$line" ]] && CHANGED_FILES+=("$line")
  done < <( { git diff --name-only; git diff --cached --name-only; } | sort -u )
else
  while IFS= read -r line; do
    [[ -n "$line" ]] && CHANGED_FILES+=("$line")
  done < <( git diff --name-only "$RANGE" | sort -u )
fi

# Allowlist high-signal files (only if they exist)
ALWAYS_INCLUDE=(
  "AGENTS.md"
  "README.md"
  "astro.config.mjs"
  "package.json"
  "pnpm-lock.yaml"
  "src/layouts/BaseLayout.astro"
  "src/pages/index.astro"
  "src/pages/shop/index.astro"
  "src/pages/p/[slug].astro"
  "src/pages/go/kaspi/[slug].ts"
  "src/lib/attribution.ts"
  "src/lib/kaspi.ts"
  "src/lib/site.ts"
  "src/content/products.json"
  "public/assets/css/styles.css"
)

# Denylist patterns (content excluded; diff still included)
is_denied() {
  local f="$1"
  [[ "$f" == ".env" ]] && return 0
  [[ "$f" == "node_modules/"* ]] && return 0
  [[ "$f" == "dist/"* ]] && return 0
  [[ "$f" == "public/assets/img/"* ]] && return 0
  [[ "$f" == ".DS_Store" ]] && return 0
  [[ "$f" == *"/.DS_Store" ]] && return 0
  case "$f" in
    *.pdf|*.png|*.jpg|*.jpeg|*.zip|*.sqlite|*.xlsx) return 0;;
  esac
  return 1
}

# Build final include list: changed (non-denied + existing) + allowlist
INCLUDE_FILES=()
add_if_exists() {
  local f="$1"
  [[ -f "$f" ]] || return 0
  INCLUDE_FILES+=("$f")
}

if [[ ${#CHANGED_FILES[@]} -gt 0 ]]; then
  for f in "${CHANGED_FILES[@]}"; do
    is_denied "$f" && continue
    add_if_exists "$f"
  done
fi

for f in "${ALWAYS_INCLUDE[@]}"; do
  add_if_exists "$f"
done

# de-dup include list
DEDUPED_INCLUDE_FILES=()
if [[ ${#INCLUDE_FILES[@]} -gt 0 ]]; then
  while IFS= read -r line; do
    [[ -n "$line" ]] && DEDUPED_INCLUDE_FILES+=("$line")
  done < <(printf "%s\n" "${INCLUDE_FILES[@]}" | sort -u)
fi
INCLUDE_FILES=("${DEDUPED_INCLUDE_FILES[@]}")

# Excerpts for large files
EXCERPT_FILES=()
if [[ ${#INCLUDE_FILES[@]} -gt 0 ]]; then
  for f in "${INCLUDE_FILES[@]}"; do
    size="$("$PYTHON_BIN" - "$f" <<'PY'
import os,sys
print(os.path.getsize(sys.argv[1]))
PY
    )"
    if [[ "$size" -gt "$MAX_BYTES" ]]; then
      ex="${TMP_DIR}/EXCERPT__${f//\//__}.md"
      "$PYTHON_BIN" - "$f" "$ex" <<'PY'
import pathlib,sys
path = pathlib.Path(sys.argv[1])
out  = pathlib.Path(sys.argv[2])
max_lines = 200
text = path.read_text(errors="replace").splitlines()
head = text[:max_lines]
tail = text[-max_lines:] if len(text) > max_lines else []
out.write_text(
    f"# EXCERPT for {path}\n"
    f"# Original bytes: {path.stat().st_size}\n"
    f"# Showing first {len(head)} lines and last {len(tail)} lines\n\n"
    "```text\n" + "\n".join(head) + "\n```\n\n"
    + ("```text\n" + "\n".join(tail) + "\n```\n" if tail else ""),
    encoding="utf-8"
)
PY
      EXCERPT_FILES+=("$ex")
    fi
  done
fi

# Write metadata
{
  echo "# Oracle Pack Metadata"
  echo
  echo "- task: ${TASK}"
  echo "- project: ${PROJECT}"
  echo "- repo_root: ${ROOT}"
  echo "- branch: ${BRANCH}"
  echo "- head: ${HEAD_SHA}"
  echo "- range: ${RANGE}"
  echo "- allow_dirty: ${ALLOW_DIRTY}"
  echo "- generated_at: $(date -Iseconds)"
  echo
  echo "## Commands run (human/agent provided)"
  if [[ "${#CMDS[@]}" -eq 0 ]]; then
    echo "- (none provided)  # tip: pass --cmd \"pnpm verify\" etc."
  else
    for c in "${CMDS[@]}"; do echo "- ${c}"; done
  fi
  echo
  echo "## Included files (content)"
  printf -- "- %s\n" "${INCLUDE_FILES[@]}"
  if [[ "${#EXCERPT_FILES[@]}" -gt 0 ]]; then
    echo
    echo "## Excerpts generated (due to size > ${MAX_BYTES} bytes)"
    printf -- "- %s\n" "${EXCERPT_FILES[@]}"
  fi
  echo
  echo "## Denylist (never include content)"
  echo "- .env, node_modules/*, dist/*, public/assets/img/*, *.pdf, *.png, *.jpg, *.zip, *.sqlite, *.xlsx"
} > "$META_FILE"

# Write diff (stat + full diff)
{
  echo "# Git Diff"
  echo
  echo "## Diff summary (stat)"
  echo
  echo '```'
  if [[ "$ALLOW_DIRTY" == "true" ]]; then
    git diff --stat || true
    git diff --cached --stat || true
  else
    git diff --stat "$RANGE" || true
  fi
  echo '```'
  echo
  echo "## Full diff"
  echo
  echo '```diff'
  if [[ "$ALLOW_DIRTY" == "true" ]]; then
    git diff || true
    echo
    echo "# --- STAGED ---"
    git diff --cached || true
  else
    git diff "$RANGE" || true
  fi
  echo '```'
} > "$DIFF_FILE"

# Build prompt
case "$PROMPT_TEMPLATE" in
  review)
    PROMPT="Review this task (${TASK}) for correctness, safety gates (execution/rollback), and idempotency. Repo=${PROJECT} head=${HEAD_SHA}. Use 0_DIFF.md to understand changes; use files for truth. Output: issues, risks, and next steps."
    ;;
  debug)
    PROMPT="Debug this task (${TASK}). Use 0_DIFF.md + files to find root cause. Repo=${PROJECT} head=${HEAD_SHA}. Output: diagnosis, minimal fix, commands to verify."
    ;;
  plan)
    PROMPT="Plan next steps for this task (${TASK}) based on the diffs and current repo. Repo=${PROJECT} head=${HEAD_SHA}. Output: ROI-ordered plan, smallest commits, verification gates."
    ;;
  *)
    PROMPT="Review this task (${TASK}). Repo=${PROJECT} head=${HEAD_SHA}. Provide actionable feedback."
    ;;
esac

# Assemble file args: meta + diff + excerpts + content files
FINAL_FILES=("$META_FILE" "$DIFF_FILE")
if [[ ${#EXCERPT_FILES[@]} -gt 0 ]]; then
  for ex in "${EXCERPT_FILES[@]}"; do FINAL_FILES+=("$ex"); done
fi
if [[ ${#INCLUDE_FILES[@]} -gt 0 ]]; then
  for f in "${INCLUDE_FILES[@]}"; do FINAL_FILES+=("$f"); done
fi

echo "Generating oracle pack → $OUT_FILE"
echo "Oracle cmd: ${ORACLE_CMD[*]} --render -p \"...\" --file <${#FINAL_FILES[@]} files>"

"${ORACLE_CMD[@]}" --render -p "$PROMPT" --file "${FINAL_FILES[@]}" > "$OUT_FILE"

echo "DONE: $OUT_FILE"
