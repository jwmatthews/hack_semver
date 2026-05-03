#!/usr/bin/env bash
# Shared configuration for the migration pipeline scripts.
# Source this file from each step script.

# ── Migration target ────────────────────────────────────────────────────
APP_REPO_URL="https://github.com/jwmatthews/quipucords-ui.git"
APP_BRANCH="original_2.1.0"

# ── PatternFly versions ─────────────────────────────────────────────────
PF_REPO_URL="https://github.com/patternfly/patternfly-react.git"
PF_CSS_REPO_URL="https://github.com/patternfly/patternfly.git"
PF_FROM="v5.3.3"
PF_TO="v6.4.1"
PF_CSS_FROM="v5.3.0"
FROM_NODE_VERSION="18"
TO_NODE_VERSION="20"

# ── Binaries ────────────────────────────────────────────────────────────
SEMVER_BIN="$HOME/synced/semver-analyzer/target/release/semver-analyzer"
FAP_BIN="$HOME/synced/frontend-analyzer-provider/target/release/frontend-analyzer-provider"
FIX_BIN="$HOME/synced/fix-engine/target/release/fix-engine-cli"
KANTRA_BIN="$HOME/bin/kantra"
KANTRA_DIR="$HOME/.kantra"

# ── LLM ─────────────────────────────────────────────────────────────────
LLM_COMMAND="goose run --no-session -q --max-turns 5 -t"
LLM_TIMEOUT=600

# ── Agent ───────────────────────────────────────────────────────────────
AGENT="${AGENT:-goose}"

# ── Work directories ────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORK_DIR="$SCRIPT_DIR/work"
REPOS_DIR="$WORK_DIR/repos"
RULES_DIR="$WORK_DIR/rules"
ANALYSIS_DIR="$WORK_DIR/analysis"

PF_REPO="$REPOS_DIR/patternfly-react"
PF_CSS_REPO="$REPOS_DIR/patternfly"
APP_REPO="$REPOS_DIR/quipucords-ui"

SEMVER_REPORT="$RULES_DIR/semver_report.json"
SEMVER_RULES="$RULES_DIR/semver_rules"
KANTRA_OUTPUT="$ANALYSIS_DIR/kantra"
KANTRA_JSON="$ANALYSIS_DIR/output.json"

FIX_STRATEGIES="$HOME/synced/semver-analyzer/fix-guidance/fix-strategies.json"

PROVIDER_PORT=9002
