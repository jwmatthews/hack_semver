#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/config.sh"

mkdir -p "$REPOS_DIR"

# Clone patternfly-react
if [[ ! -d "$PF_REPO/.git" ]]; then
  echo "Cloning patternfly-react..."
  git clone "$PF_REPO_URL" "$PF_REPO"
else
  echo "patternfly-react already cloned."
fi

# Clone patternfly (CSS)
if [[ ! -d "$PF_CSS_REPO/.git" ]]; then
  echo "Cloning patternfly (CSS)..."
  git clone "$PF_CSS_REPO_URL" "$PF_CSS_REPO"
else
  echo "patternfly (CSS) already cloned."
fi

# Checkout the latest v6 CSS tag (CSS repo uses different versioning)
PF_CSS_TAG=$(cd "$PF_CSS_REPO" && git tag -l 'v6*' --sort=-v:refname | head -1)
echo "Checking out patternfly CSS tag: $PF_CSS_TAG"
(cd "$PF_CSS_REPO" && git checkout "$PF_CSS_TAG" --force)

# Clone quipucords-ui
if [[ ! -d "$APP_REPO/.git" ]]; then
  echo "Cloning quipucords-ui..."
  git clone -b "$APP_BRANCH" "$APP_REPO_URL" "$APP_REPO"
else
  echo "quipucords-ui already cloned."
fi

echo "Done. Repos are in $REPOS_DIR"
