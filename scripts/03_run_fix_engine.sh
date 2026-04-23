#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/config.sh"

# Step 1: Apply pattern-based fixes
echo "Applying pattern-based fixes..."
"$FIX_BIN" fix "$APP_REPO" \
  --rules-strategies "$FIX_STRATEGIES" \
  --input "$KANTRA_JSON" \
  --apply 2>&1 | tee "$ANALYSIS_DIR/fix-pattern.log"

# Step 2: Apply LLM-based fixes
echo "Applying LLM-based fixes..."
"$FIX_BIN" fix "$APP_REPO" \
  --input "$KANTRA_JSON" \
  --apply \
  --llm-provider goose \
  --rules-strategies "$FIX_STRATEGIES" 2>&1 | tee "$ANALYSIS_DIR/fix-llm.log"

# Step 3: Commit the automated fixes
(cd "$APP_REPO" && \
  git add -A && \
  git diff --cached --quiet || \
  git commit -m "Apply automated migration fixes (pattern-based + LLM)") || true

echo "Done. Automated fixes applied and committed."
