#!/usr/bin/env bash
#
# setup.sh — provision a host for the site, once. Idempotent: a re-run changes nothing.
#
#   ./deploy/setup.sh
#
# Creates the web root and hands it to the deploy user, so every deploy after this is a plain file
# copy. With SITE_HOST set in deploy.local.env it also serves the site at that name: a Let's Encrypt
# certificate over the ACME webroot, and the site's nginx vhost (nginx/site.conf.in). Asks for sudo.
#
# The host's plain-HTTP surface (port 80 answering the ACME challenge from /var/lib/letsencrypt and
# upgrading everything else to https) belongs to the host, not to this site; setup.sh checks for it
# and stops when it is missing.
#
set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/deploy-common.sh"

refuse_root

command -v npm   >/dev/null || { err "npm is required to build the site"; exit 1; }
command -v rsync >/dev/null || { err "rsync is required"; exit 1; }

if [[ ! -d "$WEBROOT" ]]; then
    log "creating ${WEBROOT}"
    $SUDO install -d -o "$DEPLOY_USER" -g "$DEPLOY_GROUP" -m 755 "$WEBROOT"
fi
if [[ ! -w "$WEBROOT" ]]; then
    log "handing ${WEBROOT} to ${DEPLOY_USER}"
    $SUDO chown -R "$DEPLOY_USER:$DEPLOY_GROUP" "$WEBROOT"
fi

if [[ -z "$SITE_HOST" ]]; then
    log "no SITE_HOST in deploy/deploy.local.env: the web root is ready for another server to publish"
    exit 0
fi

command -v nginx   >/dev/null || { err "serving ${SITE_HOST} needs nginx"; exit 1; }
command -v certbot >/dev/null || { err "serving ${SITE_HOST} needs certbot"; exit 1; }

if ! $SUDO nginx -T 2>/dev/null | grep -q 'acme-challenge'; then
    err "nginx answers no ACME challenge on :80; give the host its plain-HTTP surface first"
    exit 1
fi

if $SUDO test -f "/etc/letsencrypt/live/${SITE_HOST}/fullchain.pem"; then
    log "the certificate for ${SITE_HOST} exists"
else
    log "asking Let's Encrypt for ${SITE_HOST}"
    $SUDO certbot certonly --webroot -w /var/lib/letsencrypt -d "$SITE_HOST" --cert-name "$SITE_HOST" \
        --non-interactive --agree-tos --keep-until-expiring
fi

conf="/etc/nginx/conf.d/${PROJECT}.conf"
rendered="$(mktemp)"
trap 'rm -f "$rendered"' EXIT
sed -e "s|@SITE_HOST@|${SITE_HOST}|g" -e "s|@WEBROOT@|${WEBROOT}|g" -e "s|@PROJECT@|${PROJECT//-/_}|g" \
    "${REPO_DIR}/deploy/nginx/site.conf.in" > "$rendered"
if $SUDO cmp -s "$rendered" "$conf"; then
    log "the vhost for ${SITE_HOST} is current"
else
    $SUDO install -m 0644 -o root -g root "$rendered" "$conf"
    $SUDO nginx -t >/dev/null 2>&1 || { err "nginx refused the configuration"; $SUDO rm -f "$conf"; $SUDO nginx -t; exit 1; }
    $SUDO systemctl reload nginx
    log "serving ${WEBROOT} at https://${SITE_HOST}"
fi
