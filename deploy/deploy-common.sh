#!/usr/bin/env bash
#
# deploy-common.sh — the parameter block and helpers both deploy scripts source, so setup.sh and
# deploy.sh can never disagree about where the site lands or what it is called.
#
# The pattern is the workspace's deploy template (setup.sh once per host, deploy.sh forever after). The
# site is static files with no daemon and no unit: setup.sh creates the web root, hands it to the deploy
# user and serves it through nginx; deploy.sh writes files into it, and nothing restarts.
#
# Not executable on its own.

# This file only defines things; the scripts that source it consume them.
# shellcheck disable=SC2034

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

DEPLOY_USER="${SITE_DEPLOY_USER:-$(id -un)}"
DEPLOY_GROUP="${SITE_DEPLOY_GROUP:-$(id -gn)}"

# ── PROJECT BLOCK ─────────────────────────────────────────────────────────────
PROJECT="tks-starter"

# A deploy's own values live in an untracked file beside these scripts, so the repo carries no
# deployment's names or addresses (deploy.local.env.example lists them).
[[ -f "${REPO_DIR}/deploy/deploy.local.env" ]] && source "${REPO_DIR}/deploy/deploy.local.env"

# Where the built site lands.
WEBROOT="${SITE_WEBROOT:-/srv/${PROJECT}}"

# The public name nginx serves the site at, on a Let's Encrypt certificate. Blank: setup.sh only makes
# the web root, for whatever else publishes it.
SITE_HOST="${SITE_HOST:-}"

# What deploy.sh writes into config.json beside the build: the API's address, the sign-in anchor's
# issuer and this site's client id there. Blank values run the site with no API and no sign-in.
SITE_API="${SITE_API:-}"
SITE_ISSUER="${SITE_ISSUER:-}"
SITE_CLIENT_ID="${SITE_CLIENT_ID:-}"
# ── END PROJECT BLOCK ─────────────────────────────────────────────────────────

SUDO="${SUDO:-sudo}"

log()  { printf '\033[1;34m>> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m** %s\033[0m\n' "$*" >&2; }
err()  { printf '\033[1;31m!! %s\033[0m\n' "$*" >&2; }

refuse_root() {
    if [[ "${EUID:-$(id -u)}" -eq 0 ]]; then
        err "do not run this as root; run it as the user who deploys the site."
        exit 1
    fi
}

# What deploy.sh needs from setup.sh: a web root it can write. Creating one here would need the
# privilege deploy.sh never asks for, and would hide that the host is not provisioned.
require_setup() {
    if [[ ! -d "$WEBROOT" || ! -w "$WEBROOT" ]]; then
        err "${WEBROOT} is missing or not writable by $(id -un)."
        err "this host is not provisioned for ${PROJECT}; run once: ${REPO_DIR}/deploy/setup.sh"
        exit 1
    fi
}
