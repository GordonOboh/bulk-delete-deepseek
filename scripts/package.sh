#!/usr/bin/env bash
set -euo pipefail

NAME="deepseek-bulk-delete"
VERSION=$(python3 -c "import json; print(json.load(open('manifest.json'))['version'])")
OUTDIR="dist"
OUTFILE="${OUTDIR}/${NAME}-v${VERSION}.zip"

mkdir -p "${OUTDIR}"

zip -r "${OUTFILE}" \
  manifest.json \
  icon16.png icon48.png icon128.png \
  popup.html popup.js popup.css \
  extensionCore.js config.js globals.js utils.js \
  domHandler.js conversationHandler.js checkboxManager.js \
  addCheckboxes.js removeCheckboxes.js toggleCheckboxes.js \
  bulkDeleteConversations.js background.js \
  -x ".*" -x "*/.*"

echo "Created ${OUTFILE}"
