#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="$ROOT/dist/cli/index.js"
FIXTURES="$ROOT/__tests__/fixtures"
PASS=0
FAIL=0

run_fixture() {
  local name="$1"
  local dir="$FIXTURES/$name"
  local tmpdir
  tmpdir=$(mktemp -d)

  echo "=== Smoke: $name ==="
  cp -r "$dir/." "$tmpdir/"
  cd "$tmpdir"

  export AI_AGENT=false CURSOR=false TERM_PROGRAM=dumb

  if node "$CLI" init && \
     node "$CLI" analyze && \
     node "$CLI" generate && \
     node "$CLI" export && \
     test -f .ai/project.md && \
     test -f .cursorrules && \
     ! grep -q "Simulated Local Output" .ai/project.md; then
    echo "PASS: $name"
    PASS=$((PASS + 1))
  else
    echo "FAIL: $name"
    FAIL=$((FAIL + 1))
  fi

  rm -rf "$tmpdir"
}

cd "$ROOT"
npm run build --silent

for fixture in node-cli express-api react-app; do
  if [ -d "$FIXTURES/$fixture" ]; then
    run_fixture "$fixture"
  fi
done

echo ""
echo "Results: $PASS passed, $FAIL failed"
test "$FAIL" -eq 0
