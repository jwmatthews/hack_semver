#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/config.sh"

AGENT="${1:-$AGENT}"
PROMPT_FILE="${2:-$SCRIPT_DIR/agent_prompt.md}"

case "$AGENT" in
  goose|claude|opencode) ;;
  *) echo "Usage: $0 [goose|claude|opencode] [prompt_file]" >&2; exit 1 ;;
esac

if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "ERROR: Agent prompt file not found: $PROMPT_FILE" >&2
  exit 1
fi

cd "$APP_REPO"
echo "Running $AGENT agent in $APP_REPO..."

case "$AGENT" in
  goose)
    GOOSE_MODE=auto goose run -i "$PROMPT_FILE"
    ;;
  claude)
    claude --allowedTools "Bash" "Edit" "Write" "Read" "WebSearch" "WebFetch" \
      -p "$(cat "$PROMPT_FILE")"
    ;;
  opencode)
    opencode run "$(cat "$PROMPT_FILE")"
    ;;
esac

echo "Done. Agent ($AGENT) finished."
