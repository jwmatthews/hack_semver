#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/config.sh"

mkdir -p "$KANTRA_OUTPUT"

# Step 1: Generate provider settings for kantra
PROVIDER_SETTINGS="$ANALYSIS_DIR/provider_settings.json"
cat > "$PROVIDER_SETTINGS" <<EOF
[
  {
    "name": "frontend",
    "address": "localhost:$PROVIDER_PORT",
    "initConfig": [{ "location": "$APP_REPO" }]
  },
  {
    "name": "builtin",
    "initConfig": [{ "location": "$APP_REPO" }]
  }
]
EOF

# Step 2: Start the frontend-analyzer-provider
pkill -f frontend-analyzer-provider 2>/dev/null || true
sleep 1

echo "Starting frontend-analyzer-provider on port $PROVIDER_PORT..."
"$FAP_BIN" serve -p "$PROVIDER_PORT" > "$ANALYSIS_DIR/provider.log" 2>&1 &
PROVIDER_PID=$!
trap 'kill $PROVIDER_PID 2>/dev/null || true' EXIT

# Wait for the provider to be ready
for i in $(seq 1 30); do
  if nc -z localhost "$PROVIDER_PORT" 2>/dev/null; then break; fi
  sleep 0.5
done
echo "Provider started (PID $PROVIDER_PID)"

# Step 3: Run kantra analysis
echo "Running kantra analyze..."
export KANTRA_DIR
"$KANTRA_BIN" analyze \
  --provider java \
  --input "$APP_REPO" \
  --output "$KANTRA_OUTPUT" \
  --rules "$SEMVER_RULES" \
  --override-provider-settings "$PROVIDER_SETTINGS" \
  --enable-default-rulesets=false \
  --run-local \
  --overwrite 2>&1 | tee "$ANALYSIS_DIR/kantra.log"

# Step 4: Stop the provider
kill "$PROVIDER_PID" 2>/dev/null || true
wait "$PROVIDER_PID" 2>/dev/null || true
echo "Provider stopped."

# Step 5: Convert kantra YAML output to JSON
KANTRA_YAML="$KANTRA_OUTPUT/output.yaml"
if command -v yq >/dev/null 2>&1; then
  yq -o=json '.' "$KANTRA_YAML" > "$KANTRA_JSON"
elif command -v python3 >/dev/null 2>&1; then
  python3 -c "
import yaml, json, sys
with open('$KANTRA_YAML') as f:
    data = yaml.safe_load(f)
with open('$KANTRA_JSON', 'w') as f:
    json.dump(data, f, indent=2)
"
else
  echo "ERROR: Need yq or python3 for YAML-to-JSON conversion" >&2
  exit 1
fi

echo "Done. Analysis output: $KANTRA_JSON"
