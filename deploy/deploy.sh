#!/usr/bin/env bash
#
# deploy.sh — build the site and publish it. No sudo, no prompts, nothing restarts.
#
#   ./deploy/deploy.sh
#
# Builds into dist/, writes this deploy's config.json into it from deploy.local.env, and syncs it into
# the web root. The new build is live the moment the files land.
#
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/deploy-common.sh"

trap 'err "deploy failed (line $LINENO)."; exit 1' ERR

refuse_root
require_setup

cd "$REPO_DIR"
[[ -d node_modules ]] || npm ci

log "building ${PROJECT} $("$REPO_DIR/deploy/version.sh") → dist/"
npm run build
[[ -f dist/index.html ]] || { err "the build produced no dist/index.html"; exit 1; }

# The deploy's addresses, beside the build rather than in it, so one build runs anywhere.
node -e 'process.stdout.write(JSON.stringify({ api: process.argv[1], issuer: process.argv[2], clientId: process.argv[3] }, null, 2) + "\n")' \
    "$SITE_API" "$SITE_ISSUER" "$SITE_CLIENT_ID" > dist/config.json

# --delete-after: everything new lands first, and what the old build had and this one does not goes
# last. Names are walked in order, so the hashed assets/ arrive before the index.html that names them,
# and a browser mid-load never asks for an asset already removed.
log "syncing dist/ → ${WEBROOT}"
rsync -a --delete-after dist/ "$WEBROOT/"

log "${PROJECT} is live at ${SITE_HOST:+https://${SITE_HOST} (}${WEBROOT}${SITE_HOST:+)}"
