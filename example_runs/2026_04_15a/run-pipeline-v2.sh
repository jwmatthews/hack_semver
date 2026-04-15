#!/usr/bin/env bash
#
# run-pipeline-v2.sh -- End-to-end semver analysis + migration pipeline (v2)
#
# Uses semver-analyzer (multi-language architecture).
# Isolated from run-pipeline.sh via separate work dir and provider port.
#
# Orchestrates semver-analyzer and frontend-analyzer-provider to:
#   1. Analyze a library's breaking changes (PatternFly v5 → v6)
#   2. Generate Konveyor migration rules from the analysis
#   3. Run kantra to detect violations in a consumer codebase
#   4. Apply automated fixes (pattern-based + LLM-assisted)
#
# Usage:
#   ./run-pipeline-v2.sh [OPTIONS] [STEPS...]
#
# Steps (all by default, or specify one or more):
#   build     Build semver-analyzer and frontend-analyzer-provider
#   setup     Clone/prepare patternfly-react and quipucords-ui repos
#   analyze   Run semver-analyzer against PatternFly (with LLM behavioral analysis)
#   rules     Generate Konveyor rules from analysis report
#   kantra    Run kantra against quipucords-ui with generated rules
#   fix       Apply fixes: pattern-based first, re-analyze, then LLM on remainder
#
# Options:
#   --work-dir DIR            Working directory (default: /tmp/semver-pipeline-v2)
#   --release                 Build in release mode
#   --no-llm                  Skip LLM in both analysis and fix steps
#   --llm-command CMD         LLM command for analysis
#                             (default: "goose run --no-session -q -t")
#   --llm-provider PROVIDER   Fix engine LLM backend: goose|openai (default: goose)
#   --pf-from REF             PatternFly from ref (default: v5.4.0)
#   --pf-to REF               PatternFly to ref (default: v6.1.0)
#   --pf-build-command CMD    PatternFly build command (default: yarn build:generate && yarn build:esm)
#   --include-additive        Include additive (non-breaking) rules in kantra analysis
#                             (excluded by default via --label-selector)
#   --no-pipeline-v2          Use v1 (BU) pipeline instead of v2 (TD+SD)
#   --help                    Show this help
#
# Directory layout ($WORK_DIR):
#   repos/patternfly-react/           setup clones here
#   repos/quipucords-ui/              setup clones here (v5 baseline)
#   analysis/patternfly-report.json   analyze produces this
#   rules/breaking-changes.yaml       rules produces this
#   kantra/output.yaml                kantra produces this
#   kantra/quipucords-ui-fixed/       kantra copies baseline here
#   kantra/provider_settings.json     kantra writes provider config
#   fix/kantra-post-pattern/          fix re-analysis after pattern phase
#
set -euo pipefail
export PATH=$PATH:~/bin


# ── Locate repos relative to this script ─────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEMVER_DIR="$SCRIPT_DIR/semver-analyzer"
FAP_DIR="$SCRIPT_DIR/frontend-analyzer-provider"

if [[ ! -d "$SEMVER_DIR/src" ]]; then
    echo "ERROR: semver-analyzer not found at $SEMVER_DIR"
    echo "       This script must live in the parent directory of both repos."
    exit 1
fi
if [[ ! -d "$FAP_DIR/src" ]]; then
    echo "ERROR: frontend-analyzer-provider not found at $FAP_DIR"
    echo "       This script must live in the parent directory of both repos."
    exit 1
fi

# ── Defaults ─────────────────────────────────────────────────────────────

WORK_DIR="/tmp/semver-pipeline-v2"
RELEASE=false
NO_LLM=false
LLM_COMMAND="goose run --no-session -q --max-turns 5 -t"
LLM_PROVIDER="goose"
PF_FROM="v5.4.0"
PF_TO="v6.4.1"
PF_REPO_URL="https://github.com/patternfly/patternfly-react.git"
PF_CSS_REPO_URL="https://github.com/patternfly/patternfly.git"
QUIPUCORDS_REPO_URL="git@github.com:quipucords/quipucords-ui.git"
QUIPUCORDS_V5_COMMIT="3b3ce52"
INCLUDE_ADDITIVE=false
PIPELINE_V2=true  # v2 is the default; use --no-pipeline-v2 to disable
PROVIDER_PORT=9002
    
# PatternFly requires a codegen step (yarn build:generate) before tsc
# can compile packages that depend on generated source files (e.g.,
# react-tokens). The build:esm step runs tsc --build with topological
# ordering via project references.
PF_BUILD_CMD="yarn build:generate && yarn build:esm"

REQUESTED_STEPS=()

# ── Parse args ───────────────────────────────────────────────────────────

ALL_STEPS=(build setup analyze rules kantra fix)

usage() {
    sed -n '2,/^set /{ /^set /d; s/^# \{0,1\}//; p; }' "$0"
    exit 0
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --work-dir)         WORK_DIR="$2";         shift 2 ;;
        --release)          RELEASE=true;           shift ;;
        --no-llm)           NO_LLM=true;            shift ;;
        --llm-command)      LLM_COMMAND="$2";       shift 2 ;;
        --llm-provider)     LLM_PROVIDER="$2";      shift 2 ;;
        --pf-build-command) PF_BUILD_CMD="$2";      shift 2;;
        --pf-from)          PF_FROM="$2";           shift 2 ;;
        --pf-to)            PF_TO="$2";             shift 2 ;;
        --include-additive) INCLUDE_ADDITIVE=true;  shift ;;
        --no-pipeline-v2)   PIPELINE_V2=false;      shift ;;
        --help|-h)          usage ;;
        -*)                 echo "Unknown option: $1"; usage ;;
        *)
            # Validate step name
            valid=false
            for s in "${ALL_STEPS[@]}"; do
                [[ "$1" == "$s" ]] && valid=true && break
            done
            if $valid; then
                REQUESTED_STEPS+=("$1")
            else
                echo "Unknown step: $1"
                echo "Valid steps: ${ALL_STEPS[*]}"
                exit 1
            fi
            shift
            ;;
    esac
done

# Default: run all steps
if [[ ${#REQUESTED_STEPS[@]} -eq 0 ]]; then
    REQUESTED_STEPS=("${ALL_STEPS[@]}")
fi

should_run() {
    local step="$1"
    for s in "${REQUESTED_STEPS[@]}"; do
        [[ "$s" == "$step" ]] && return 0
    done
    return 1
}

# ── Well-known paths ─────────────────────────────────────────────────────

REPOS_DIR="$WORK_DIR/repos"
PF_REPO="$REPOS_DIR/patternfly-react"
PF_CSS_REPO="$REPOS_DIR/patternfly"
QUIPUCORDS="$REPOS_DIR/quipucords-ui"

ANALYSIS_DIR="$WORK_DIR/analysis"
REPORT="$ANALYSIS_DIR/patternfly-report.json"

RULES_DIR="$WORK_DIR/rules"

KANTRA_DIR="$WORK_DIR/kantra"
KANTRA_OUTPUT_DIR="$KANTRA_DIR/output"
KANTRA_OUTPUT="$KANTRA_OUTPUT_DIR/output.yaml"
KANTRA_SETTINGS="$KANTRA_DIR/provider_settings.json"
QUIPUCORDS_FIXED="$KANTRA_DIR/quipucords-ui-fixed"

FIX_DIR="$WORK_DIR/fix"
FIX_STRATEGIES="$WORK_DIR/fix-guidance/fix-strategies.json"
KANTRA_POST_PATTERN="$FIX_DIR/kantra-post-pattern"

# ── Binary paths ─────────────────────────────────────────────────────────

if [[ "$RELEASE" == true ]]; then
    SEMVER_BIN="$SEMVER_DIR/target/release/semver-analyzer"
    FAP_BIN="$FAP_DIR/target/release/frontend-analyzer-provider"
    BUILD_FLAGS="--release"
else
    SEMVER_BIN="$SEMVER_DIR/target/debug/semver-analyzer"
    FAP_BIN="$FAP_DIR/target/debug/frontend-analyzer-provider"
    BUILD_FLAGS=""
fi

# ── Helpers ──────────────────────────────────────────────────────────────

step_header() {
    echo ""
    echo "============================================================"
    echo "  $1"
    echo "============================================================"
}

require_file() {
    local path="$1"
    local step="$2"
    if [[ ! -f "$path" ]]; then
        echo "ERROR: Required input not found: $path"
        echo "       Run the '$step' step first."
        exit 1
    fi
}

require_dir() {
    local path="$1"
    local step="$2"
    if [[ ! -d "$path" ]]; then
        echo "ERROR: Required directory not found: $path"
        echo "       Run the '$step' step first."
        exit 1
    fi
}

require_command() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "ERROR: Required command not found: $1"
        exit 1
    fi
}

start_provider() {
    local target_dir="$1"

    # Write provider settings
    cat > "$KANTRA_SETTINGS" <<PSJSON
[
    {
        "name": "frontend",
        "address": "localhost:$PROVIDER_PORT",
        "initConfig": [
            {
                "analysisMode": "source-only",
                "location": "$target_dir"
            }
        ]
    },
    {
        "name": "builtin",
        "initConfig": [
            {
                "location": "$target_dir"
            }
        ]
    }
]
PSJSON

    # Kill any leftover provider on our port (avoid killing v1 pipeline's provider)
    pkill -f "frontend-analyzer-provider.*serve.*--port $PROVIDER_PORT" 2>/dev/null || true
    sleep 1

    "$FAP_BIN" serve --port "$PROVIDER_PORT" &
    PROVIDER_PID=$!
    sleep 3

    if ! kill -0 "$PROVIDER_PID" 2>/dev/null; then
        echo "ERROR: frontend-analyzer-provider failed to start"
        exit 1
    fi
    echo "    Provider started (PID $PROVIDER_PID)"
}

stop_provider() {
    if [[ -n "${PROVIDER_PID:-}" ]]; then
        kill "$PROVIDER_PID" 2>/dev/null || true
        wait "$PROVIDER_PID" 2>/dev/null || true
        unset PROVIDER_PID
        echo "    Provider stopped"
    fi
}

run_kantra() {
    local input_dir="$1"
    local rules_dir="$2"
    local output_dir="$3"

    rm -rf "$output_dir"
    mkdir -p "$output_dir"

    # Build label selector args.
    # By default, exclude additive (non-breaking) rules like new union members
    # or added optional properties. Use --include-additive to include them.
    local label_args=()
    if ! $INCLUDE_ADDITIVE; then
        label_args=(--label-selector '!change-scope=additive')
    fi

    kantra analyze \
        --input "$input_dir" \
        --output "$output_dir" \
        --rules "$rules_dir" \
        --override-provider-settings "$KANTRA_SETTINGS" \
        --enable-default-rulesets=false \
        --skip-static-report \
        --mode source-only \
        --run-local \
        --overwrite \
        --no-progress \
        --provider java \
        "${label_args[@]}" \
        2>&1
}

# Ensure provider is stopped on exit
trap 'stop_provider' EXIT

# ── Print config ─────────────────────────────────────────────────────────

echo "============================================================"
echo "  semver-analyzer + frontend-analyzer-provider Pipeline"
echo "============================================================"
echo "  Steps:      ${REQUESTED_STEPS[*]}"
echo "  Work dir:   $WORK_DIR"
echo "  PF range:   $PF_FROM -> $PF_TO"
echo "  LLM:        $(if $NO_LLM; then echo "disabled"; else echo "$LLM_COMMAND"; fi)"
echo "  Build mode: $(if $RELEASE; then echo "release"; else echo "debug"; fi)"
echo "  Additive:   $(if $INCLUDE_ADDITIVE; then echo "included"; else echo "excluded (use --include-additive to include)"; fi)"
echo "  Pipeline:   $(if $PIPELINE_V2; then echo "v2 (TD+SD)"; else echo "v1 (BU)"; fi)"
echo "============================================================"

mkdir -p "$WORK_DIR"

# ═════════════════════════════════════════════════════════════════════════
# Step: build
# ═════════════════════════════════════════════════════════════════════════

if should_run build; then
    step_header "Step: build"

    echo "  Building semver-analyzer..."
    (cd "$SEMVER_DIR" && cargo build $BUILD_FLAGS 2>&1)

    echo "  Building frontend-analyzer-provider..."
    (cd "$FAP_DIR" && cargo build $BUILD_FLAGS 2>&1)

    echo ""
    echo "  semver-analyzer:            $SEMVER_BIN"
    echo "  frontend-analyzer-provider: $FAP_BIN"
fi

# ═════════════════════════════════════════════════════════════════════════
# Step: setup
# ═════════════════════════════════════════════════════════════════════════

if should_run setup; then
    step_header "Step: setup"
    mkdir -p "$REPOS_DIR"

    # PatternFly React
    if [[ -d "$PF_REPO/.git" ]]; then
        echo "  PatternFly: using existing clone at $PF_REPO"
        (cd "$PF_REPO" && git fetch --tags 2>/dev/null || true)
    else
        # Check for a local testdata copy first
        if [[ -d "$SCRIPT_DIR/testdata/patternfly-react/.git" ]]; then
            echo "  PatternFly: copying from testdata/patternfly-react..."
            cp -a "$SCRIPT_DIR/testdata/patternfly-react" "$PF_REPO"
        else
            echo "  PatternFly: cloning from $PF_REPO_URL..."
            git clone --bare "$PF_REPO_URL" "$PF_REPO/.git"
            (cd "$PF_REPO" && git config core.bare false && git checkout "$PF_TO" 2>/dev/null)
        fi
    fi

    # PatternFly CSS (design tokens, CSS variables)
    if [[ -d "$PF_CSS_REPO/.git" ]]; then
        echo "  PatternFly CSS: using existing clone at $PF_CSS_REPO"
        (cd "$PF_CSS_REPO" && git fetch --tags 2>/dev/null || true)
    else
        echo "  PatternFly CSS: cloning from $PF_CSS_REPO_URL..."
        git clone "$PF_CSS_REPO_URL" "$PF_CSS_REPO"
    fi
    # Check out at the latest v6 tag (CSS repo has different versioning than patternfly-react)
    PF_CSS_TAG=$(cd "$PF_CSS_REPO" && git tag -l 'v6*' --sort=-v:refname 2>/dev/null | head -1)
    if [[ -n "$PF_CSS_TAG" ]]; then
        echo "  PatternFly CSS: checking out $PF_CSS_TAG"
        (cd "$PF_CSS_REPO" && git checkout "$PF_CSS_TAG" --force 2>/dev/null)
    else
        echo "  WARNING: No v6 tag found in CSS repo, using $PF_TO"
        (cd "$PF_CSS_REPO" && git checkout "$PF_TO" --force 2>/dev/null || true)
    fi

    # Quipucords UI
    if [[ -d "$QUIPUCORDS/.git" ]]; then
        echo "  Quipucords: using existing clone, hard-resetting to $QUIPUCORDS_V5_COMMIT"
        (cd "$QUIPUCORDS" && git checkout "$QUIPUCORDS_V5_COMMIT" --force 2>/dev/null && git clean -fd 2>/dev/null)
    else
        echo "  Quipucords: cloning from $QUIPUCORDS_REPO_URL..."
        git clone "$QUIPUCORDS_REPO_URL" "$QUIPUCORDS"
        (cd "$QUIPUCORDS" && git checkout "$QUIPUCORDS_V5_COMMIT" 2>/dev/null)
    fi

    echo ""
    echo "  PatternFly:      $PF_REPO"
    echo "  PatternFly CSS:  $PF_CSS_REPO"
    echo "  Quipucords:      $QUIPUCORDS (at $QUIPUCORDS_V5_COMMIT)"
fi

# ═════════════════════════════════════════════════════════════════════════
# Step: analyze
# ═════════════════════════════════════════════════════════════════════════

if should_run analyze; then
    step_header "Step: analyze"
    require_dir "$PF_REPO" "setup"
    mkdir -p "$ANALYSIS_DIR"

    LLM_FLAGS=""
    if [[ "$NO_LLM" == true ]]; then
        LLM_FLAGS="--no-llm"
        echo "  Mode: static analysis only (--no-llm)"
    else
        LLM_FLAGS="--llm-command \"$LLM_COMMAND\""
        echo "  Mode: static + LLM behavioral analysis"
        echo "  LLM:  $LLM_COMMAND"
    fi

    ANALYZE_LOG="$ANALYSIS_DIR/analyze.log"
    echo "  Analyzing PatternFly $PF_FROM -> $PF_TO..."
    echo "  Log: $ANALYZE_LOG"
    echo ""



    PIPELINE_FLAG=""
    if [[ "$PIPELINE_V2" == true ]]; then
        PIPELINE_FLAG="--pipeline-v2"
        echo "  Pipeline: v2 (TD+SD)"
    fi

    # Pass the CSS repo for CSS profile extraction + dep-update rule.
    # The CSS repo needs to be built (SCSS → CSS) before extraction.
    DEP_REPO_ARGS=()
    DEP_BUILD_CMD=""
    if [[ -d "$PF_CSS_REPO/.git" ]]; then
        PF_CSS_TAG=$(cd "$PF_CSS_REPO" && git tag -l 'v6*' --sort=-v:refname 2>/dev/null | head -1)
        PF_CSS_FROM=$(cd "$PF_CSS_REPO" && git tag -l 'v5*' --sort=-v:refname 2>/dev/null | head -1)
        DEP_REPO_ARGS+=(--dep-repo "$PF_CSS_REPO")
        if [[ -n "$PF_CSS_TAG" ]]; then
            DEP_REPO_ARGS+=(--dep-to "$PF_CSS_TAG")
        fi
        if [[ -n "$PF_CSS_FROM" ]]; then
            DEP_REPO_ARGS+=(--dep-from "$PF_CSS_FROM")
        fi
        # Build the CSS repo: install deps then compile SCSS → CSS into dist/.
        # The prepare script (husky install) may fail in worktrees, but
        # yarn install still succeeds. buildPatternfly compiles SCSS and
        # writes CSS to dist/components/<Name>/<name>.css.
        #DEP_BUILD_CMD="export NODE_ENV=development && yarn install && npx gulp buildPatternfly"
        DEP_BUILD_CMD="source ~/.nvm/nvm.sh && nvm exec \"20.11.0\" bash -c 'export NODE_ENV=development && corepack yarn install --immutable && corepack yarn gulp buildPatternfly'"

        DEP_REPO_ARGS+=(--dep-build-command "$DEP_BUILD_CMD")
        echo "  CSS dep repo: $PF_CSS_REPO (from=${PF_CSS_FROM:-?} to=${PF_CSS_TAG:-?})"
    fi

    if [[ "$NO_LLM" == true ]]; then
        "$SEMVER_BIN" analyze typescript \
            --repo "$PF_REPO" \
            --from "$PF_FROM" \
            --to "$PF_TO" \
            --no-llm \
            --build-command "$PF_BUILD_CMD" \
            --log-file "$ANALYZE_LOG" \
            --log-level debug \
            $PIPELINE_FLAG \
            "${DEP_REPO_ARGS[@]}" \
            -o "$REPORT"
    else
        "$SEMVER_BIN" analyze typescript \
            --repo "$PF_REPO" \
            --from "$PF_FROM" \
            --to "$PF_TO" \
            --llm-command "$LLM_COMMAND" \
            --build-command "$PF_BUILD_CMD" \
            --log-file "$ANALYZE_LOG" \
            --log-level debug \
            $PIPELINE_FLAG \
            "${DEP_REPO_ARGS[@]}" \
            -o "$REPORT"
    fi

    echo ""
    echo "  Report: $REPORT ($(wc -c < "$REPORT" | tr -d ' ') bytes)"
    echo "  Log:    $ANALYZE_LOG"
    if command -v jq >/dev/null 2>&1; then
        echo "  Breaking changes: $(jq '.summary.total_breaking_changes' "$REPORT")"
        echo "  API changes:      $(jq '.summary.breaking_api_changes' "$REPORT")"
        echo "  Behavioral:       $(jq '.summary.breaking_behavioral_changes' "$REPORT")"
        if [[ "$PIPELINE_V2" == true ]]; then
            echo "  SD source-level:  $(jq '.sd_result.source_level_changes | length' "$REPORT")"
            echo "  SD compositions:  $(jq '.sd_result.composition_trees | length' "$REPORT")"
            echo "  SD conformance:   $(jq '.sd_result.conformance_checks | length' "$REPORT")"
        fi
    fi
fi

# ═════════════════════════════════════════════════════════════════════════
# Step: rules
# ═════════════════════════════════════════════════════════════════════════

if should_run rules; then
    step_header "Step: rules"
    require_file "$REPORT" "analyze"

    # Clean old rules to avoid stale data
    if [[ -d "$RULES_DIR" ]]; then
        echo "  Cleaning old rules..."
        rm -rf "$RULES_DIR"
    fi
    if [[ -d "$WORK_DIR/fix-guidance" ]]; then
        rm -rf "$WORK_DIR/fix-guidance"
    fi

    RULES_LOG="$RULES_DIR/rules.log"
    echo "  Generating Konveyor rules..."
    echo "  Log: $RULES_LOG"

    mkdir -p "$RULES_DIR"

    # Token mappings file — authoritative old→new mappings from upstream
    # PF codemods that override the algorithmic rename detection.
    TOKEN_MAPPINGS="$SEMVER_DIR/hack/integration/patternfly-token-mappings.yaml"
    RENAME_FLAG=""
    if [[ -f "$TOKEN_MAPPINGS" ]]; then
        RENAME_FLAG="--rename-patterns $TOKEN_MAPPINGS"
        echo "  Using token mappings: $TOKEN_MAPPINGS"
    fi

    PIPELINE_FLAG=""
    if [[ "$PIPELINE_V2" == true ]]; then
        PIPELINE_FLAG="--pipeline-v2"
        echo "  Pipeline: v2 (TD+SD)"
    fi

    "$SEMVER_BIN" konveyor typescript \
        --from-report "$REPORT" \
        --output-dir "$RULES_DIR" \
        --log-file "$RULES_LOG" \
        --log-level debug \
        $RENAME_FLAG \
        $PIPELINE_FLAG

    echo ""
    if command -v yq >/dev/null 2>&1; then
        RULE_COUNT=$(yq 'length' "$RULES_DIR/breaking-changes.yaml" 2>/dev/null || echo "?")
        echo "  Rules generated: $RULE_COUNT"
    fi
    echo "  Output: $RULES_DIR/"
    echo "  Log:    $RULES_LOG"
fi

# ═════════════════════════════════════════════════════════════════════════
# Step: kantra
# ═════════════════════════════════════════════════════════════════════════

if should_run kantra; then
    step_header "Step: kantra"
    require_dir "$RULES_DIR" "rules"
    require_dir "$QUIPUCORDS" "setup"
    require_command kantra

    # Warn if rules are older than the semver-analyzer binary
    if [[ -f "$SEMVER_BIN" ]] && [[ -f "$RULES_DIR/breaking-changes.yaml" ]]; then
        if [[ "$SEMVER_BIN" -nt "$RULES_DIR/breaking-changes.yaml" ]]; then
            echo "  WARNING: Rules are older than the semver-analyzer binary."
            echo "           Run with 'rules' step to regenerate: ./run-pipeline-v2.sh rules kantra fix"
        fi
    fi

    mkdir -p "$KANTRA_DIR"

    # Fresh copy of quipucords for analysis + fixing
    echo "  Preparing quipucords-ui copy for analysis..."
    rm -rf "$QUIPUCORDS_FIXED"
    cp -a "$QUIPUCORDS" "$QUIPUCORDS_FIXED"


    echo "  Starting frontend-analyzer-provider..."
    start_provider "$QUIPUCORDS_FIXED"

    echo "  Running kantra..."
    run_kantra "$QUIPUCORDS_FIXED" "$RULES_DIR" "$KANTRA_OUTPUT_DIR"

    stop_provider

    if [[ -f "$KANTRA_OUTPUT" ]]; then
        echo ""
        if command -v yq >/dev/null 2>&1; then
            VIOLATIONS=$(yq '[.[].violations | length]' "$KANTRA_OUTPUT" 2>/dev/null | awk '/^- /{sum+=$2} END{print sum+0}' || echo "?")
            INCIDENTS=$(yq '[.[].violations[].incidents | length]' "$KANTRA_OUTPUT" 2>/dev/null | awk '/^- /{sum+=$2} END{print sum+0}' || echo "?")
            echo "  Violations: $VIOLATIONS"
            echo "  Incidents:  $INCIDENTS"
        fi
        echo "  Output: $KANTRA_OUTPUT"
    else
        echo "  WARNING: No kantra output produced"
    fi
fi

# ═════════════════════════════════════════════════════════════════════════
# Step: fix
# ═════════════════════════════════════════════════════════════════════════

if should_run fix; then
    step_header "Step: fix"
    require_file "$KANTRA_OUTPUT" "kantra"
    require_dir "$QUIPUCORDS" "setup"
    require_dir "$RULES_DIR" "rules"

    mkdir -p "$FIX_DIR"

    # Convert YAML to JSON for fix engine
    FIX_INPUT="$FIX_DIR/kantra-violations.json"
    yq -o=json '.' "$KANTRA_OUTPUT" > "$FIX_INPUT"

    # ── Phase 1: Pattern-based fixes ─────────────────────────────────

    # Build strategies flag (all strategies come from semver-analyzer)
    STRATEGIES_FLAG=""
    if [[ -f "$FIX_STRATEGIES" ]]; then
        STRATEGIES_FLAG="--strategies $FIX_STRATEGIES"
        echo "  Using fix strategies: $FIX_STRATEGIES"
    fi

    echo ""
    echo "  Phase 1: Pattern-based fixes..."

    #JWM Change
    ##"$FAP_BIN" fix "$QUIPUCORDS_FIXED" \
    fix-engine-cli fix "$QUIPUCORDS_FIXED" \
        --input "$FIX_INPUT" \
        --apply \
        $STRATEGIES_FLAG \
        2>&1 || echo "  WARNING: Pattern fix exited with non-zero status ($?)"

    PATTERN_CHANGES=$(cd "$QUIPUCORDS_FIXED" && git diff --stat HEAD 2>/dev/null | tail -1 || true)
    echo ""
    echo "  Pattern fix result: $PATTERN_CHANGES"

    # ── Re-analyze after pattern fixes (always runs) ────────────────

    echo ""
    echo "  Re-analyzing after pattern fixes..."

    start_provider "$QUIPUCORDS_FIXED"

    mkdir -p "$KANTRA_POST_PATTERN"
    run_kantra "$QUIPUCORDS_FIXED" "$RULES_DIR" "$KANTRA_POST_PATTERN"

    stop_provider

    if [[ -f "$KANTRA_POST_PATTERN/output.yaml" ]]; then
        REMAINING=$(yq '[.[].violations[].incidents | length]' "$KANTRA_POST_PATTERN/output.yaml" 2>/dev/null | awk '/^- /{sum+=$2} END{print sum+0}' || echo "?")
        echo "  Remaining incidents after pattern fix: $REMAINING"
    fi

    # ── Phase 2: LLM-assisted fixes (requires --no-llm to be off) ──

    if [[ "$NO_LLM" == false ]]; then
        echo ""
        echo "  Phase 2: LLM-assisted fixes (provider: $LLM_PROVIDER)..."

        LLM_INPUT="$FIX_DIR/kantra-post-pattern.json"
        yq -o=json '.' "$KANTRA_POST_PATTERN/output.yaml" > "$LLM_INPUT"

        GOOSE_LOG_DIR="$FIX_DIR/goose-logs"
        mkdir -p "$GOOSE_LOG_DIR"

        #JWM Change
        #"$FAP_BIN" fix "$QUIPUCORDS_FIXED" \
        fix-engine-cli fix "$QUIPUCORDS_FIXED" \
            --input "$LLM_INPUT" \
            --apply \
            --llm-provider "$LLM_PROVIDER" \
            --verbose \
            --log-dir "$GOOSE_LOG_DIR" \
            $STRATEGIES_FLAG \
            2>&1 || echo "  WARNING: LLM fix exited with non-zero status ($?)"

        LLM_CHANGES=$(cd "$QUIPUCORDS_FIXED" && git diff --stat HEAD 2>/dev/null | tail -1 || true)
        echo ""
        echo "  LLM fix result: $LLM_CHANGES"
    else
        echo ""
        echo "  Skipping LLM fix phase (--no-llm)"
    fi

    # ── Summary ──────────────────────────────────────────────────────

    echo ""
    TOTAL_CHANGES=$(cd "$QUIPUCORDS_FIXED" && git diff --numstat HEAD 2>/dev/null | wc -l | tr -d ' ' || true)
    echo "  Total files modified: $TOTAL_CHANGES"
    echo "  Fixed codebase: $QUIPUCORDS_FIXED"
fi

# ═════════════════════════════════════════════════════════════════════════
# Done
# ═════════════════════════════════════════════════════════════════════════

echo ""
echo "============================================================"
echo "  Pipeline Complete"
echo "============================================================"
echo ""
echo "  Outputs:"
[[ -f "$REPORT" ]]        && echo "    Analysis report:  $REPORT"
[[ -d "$RULES_DIR" ]]     && echo "    Konveyor rules:   $RULES_DIR/"
[[ -f "$KANTRA_OUTPUT" ]]  && echo "    Kantra output:    $KANTRA_OUTPUT"
[[ -d "$QUIPUCORDS_FIXED" ]] && echo "    Fixed codebase:   $QUIPUCORDS_FIXED/"
echo ""
echo "  To inspect results:"
[[ -f "$KANTRA_OUTPUT" ]]  && echo "    yq '.[].violations | keys' $KANTRA_OUTPUT"
[[ -d "$QUIPUCORDS_FIXED" ]] && echo "    cd $QUIPUCORDS_FIXED && git diff --stat"
echo ""
