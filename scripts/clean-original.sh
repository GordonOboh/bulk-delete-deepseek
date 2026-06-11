#!/usr/bin/env bash
set -euo pipefail

# Removes files inherited from the upstream qcrao/bulk-delete-chatGPT
# that are not needed for the DeepSeek fork.
#
# Exempts (preserves):
#   scripts/package.sh          — our packaging script
#   scripts/clean-original.sh   — this script itself
#   agent/*                     — our docs (agent_diff.md, contact-request.md, store-checklist.md)

echo "=== Cleaning up original ChatGPT files ==="

# --- Remove ChatGPT-specific source files ---
rm -f bulkArchiveConversations.js
echo "  removed: bulkArchiveConversations.js"

rm -f manifest.firefox.json
echo "  removed: manifest.firefox.json"

# --- Remove docs ---
rm -f AGENTS.md CLAUDE.md DAILY_WORKFLOW.md README-CN.md
echo "  removed: AGENTS.md, CLAUDE.md, DAILY_WORKFLOW.md, README-CN.md"

# --- Remove original files in .agents/ except ours ---
shopt -s nullglob
for f in .agents/*; do
  base=$(basename "$f")
  if [ "$base" = "opencode" ]; then
    echo "  preserving directory: $f/"
    continue
  fi
  if [ "$base" != "agent_diff.md" ] && [ "$base" != "contact-request.md" ] && [ "$base" != "store-checklist.md" ]; then
    rm -f "$f"
    echo "  removed: $f"
  fi
done
shopt -u nullglob

rm -rf .claude
echo "  removed: .claude/"

# --- Remove assets ---
rm -rf assets
echo "  removed: assets/"

echo "=== Cleanup complete ==="
echo "Preserved: scripts/package.sh scripts/clean-original.sh agent/* .agents/agent_diff.md .agents/contact-request.md .agents/store-checklist.md"
