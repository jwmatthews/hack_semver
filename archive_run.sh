#!/usr/bin/env bash
set -euo pipefail

SRC="/tmp/semver-pipeline-v2"
DEST_BASE="/Users/jmatthews/synced/hack_semver/example_runs"

if [ ! -d "$SRC" ]; then
  echo "Error: source directory $SRC does not exist" >&2
  exit 1
fi

# Build destination path: YYYY_MM_DDa, YYYY_MM_DDb, etc.
date_prefix=$(date +%Y_%m_%d)
suffix="a"
while [ -d "${DEST_BASE}/${date_prefix}${suffix}" ]; do
  # Increment suffix: a->b, b->c, ...
  suffix=$(echo "$suffix" | tr 'a-y' 'b-z')
done
dest="${DEST_BASE}/${date_prefix}${suffix}"

echo "Archiving $SRC -> $dest"
rsync -a \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='out' \
  --exclude='target' \
  --exclude='bin' \
  --exclude='*.o' \
  --exclude='*.so' \
  --exclude='*.dylib' \
  --exclude='*.a' \
  --exclude='*.exe' \
  "$SRC/" "$dest/"
echo "Done. Archived to $dest"
