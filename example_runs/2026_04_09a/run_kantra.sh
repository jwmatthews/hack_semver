# I need to run frontend-analyzer-provider first
# ./frontend-analyzer-provider serve -p 9003

INPUT_PROJECT="/tmp/semver-pipeline-v2/repos/quipucords-ui/"
OUTPUT_DIR="./out"
RULES_DIR="/tmp/semver-pipeline-v2/rules"

kantra analyze --provider java --input "$INPUT_PROJECT" --output "${OUTPUT_DIR}/kantra" --rules "${RULES_DIR}" --override-provider-settings provider_settings.json --enable-default-rulesets=false --run-local --overwrite

