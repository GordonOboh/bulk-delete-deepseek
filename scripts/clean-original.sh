#!/usr/bin/env bash
set -euo pipefail

# Removes files inherited from the upstream qcrao/bulk-delete-chatGPT
# that are not needed for the DeepSeek fork.
#
# Exempts (preserves):
#   scripts/package.sh      — our packaging script
#   agent/*                 — our docs (agent_diff.md, contact-request.md, store-checklist.md)

echo "=== Cleaning up original ChatGPT files ==="

# --- Remove ChatGPT-specific source files ---
rm -f bulkArchiveConversations.js
echo "  removed: bulkArchiveConversations.js"

rm -f manifest.firefox.json
echo "  removed: manifest.firefox.json"

# --- Remove docs ---
rm -f AGENTS.md CLAUDE.md DAILY_WORKFLOW.md README-CN.md
echo "  removed: AGENTS.md, CLAUDE.md, DAILY_WORKFLOW.md, README-CN.md"

# --- Remove agent configs ---
rm -rf .agents .claude
echo "  removed: .agents/ .claude/"

# --- Remove assets ---
rm -rf assets
echo "  removed: assets/"

# --- Clean scripts/ except our files ---
# Remove every original script in scripts/ except package.sh
for f in scripts/*.sh; do
  base=$(basename "$f")
  if [ "$base" != "package.sh" ]; then
    rm -f "$f"
    echo "  removed: $f"
  fi
done

echo "=== Cleanup complete ==="
echo "Preserved: scripts/package.sh agent/*"
