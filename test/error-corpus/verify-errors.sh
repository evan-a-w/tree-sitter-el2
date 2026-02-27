#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
ERR_DIR="$ROOT_DIR/test/error-corpus"

if ! command -v tree-sitter >/dev/null 2>&1; then
  echo "tree-sitter CLI not found in PATH" >&2
  exit 1
fi

failed=0
for f in "$ERR_DIR"/*.el2; do
  out=$(XDG_CACHE_HOME="${XDG_CACHE_HOME:-/tmp}" tree-sitter parse --grammar-path "$ROOT_DIR" "$f" 2>/dev/null || true)
  if echo "$out" | rg -q '\(ERROR|MISSING'; then
    echo "ok  $(basename "$f")"
  else
    echo "FAIL $(basename "$f") (no ERROR/MISSING nodes found)" >&2
    failed=1
  fi
done

exit "$failed"
