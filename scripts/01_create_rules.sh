#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/config.sh"

mkdir -p "$RULES_DIR" "$SEMVER_RULES"

# Resolve the latest v6 CSS tag for dep-to
PF_CSS_TAG=$(cd "$PF_CSS_REPO" && git tag -l 'v6*' --sort=-v:refname | head -1)
echo "Using patternfly CSS dep-from=$PF_CSS_FROM dep-to=$PF_CSS_TAG"

# Step 1: Analyze API changes between PatternFly versions
echo "Running semver-analyzer analyze..."
time "$SEMVER_BIN" analyze typescript \
  --repo "$PF_REPO" \
  --from "$PF_FROM" \
  --to "$PF_TO" \
  --from-node-version "$FROM_NODE_VERSION" \
  --to-node-version "$TO_NODE_VERSION" \
  --from-install-command "corepack yarn install" \
  --build-command "corepack yarn build" \
  --dep-repo "$PF_CSS_REPO" \
  --dep-from "$PF_CSS_FROM" \
  --dep-to "$PF_CSS_TAG" \
  --dep-build-command "source ~/.nvm/nvm.sh && nvm exec ${TO_NODE_VERSION} bash -c 'export NODE_ENV=development && corepack yarn install --immutable && corepack yarn gulp buildPatternfly'" \
  --llm-command "goose run --no-session -q --max-turns 5 -t" \
  --log-level debug \
  --log-file "$RULES_DIR/semver_analyze_debug.log"
  -o "$SEMVER_REPORT" 2>&1 | tee "$RULES_DIR/semver_analyze.log"

echo "Report: $SEMVER_REPORT"

# Step 2: Generate Konveyor rules from the report
echo "Running semver-analyzer konveyor..."
"$SEMVER_BIN" konveyor typescript \
  --from-report "$SEMVER_REPORT" \
  --output-dir "$SEMVER_RULES" \
  --log-level info 2>&1 | tee "$RULES_DIR/semver_konveyor.log"

echo "Done. Rules are in $SEMVER_RULES"
