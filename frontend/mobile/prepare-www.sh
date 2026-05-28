#!/usr/bin/env bash
# prepare-www.sh — syncs the webapp into Cordova www/ and applies mobile overrides
# Run this before: cordova build android   (or   cordova build ios)
#
# Usage:  cd frontend/mobile && bash prepare-www.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEBAPP="$SCRIPT_DIR/../webapp"
WWW="$SCRIPT_DIR/www"

echo "▶ Syncing webapp → www/ ..."
rsync -a --delete \
    --exclude='test/' \
    --exclude='*.map' \
    "$WEBAPP/" "$WWW/"

echo "▶ Copying Cordova-specific files ..."
# Mobile index.html has: cordova.js, CSP, frame-options=allow, local Leaflet
cp "$SCRIPT_DIR/src/index.html" "$WWW/index.html"

echo "▶ Downloading Leaflet locally (CSP blocks CDN in WebView) ..."
mkdir -p "$WWW/js" "$WWW/css/images"
curl -sL https://unpkg.com/leaflet@1.9.4/dist/leaflet.js     -o "$WWW/js/leaflet.js"
curl -sL https://unpkg.com/leaflet@1.9.4/dist/leaflet.css    -o "$WWW/css/leaflet.css"
curl -sL https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png    -o "$WWW/css/images/marker-icon.png"
curl -sL https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png -o "$WWW/css/images/marker-icon-2x.png"
curl -sL https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png  -o "$WWW/css/images/marker-shadow.png"
curl -sL https://unpkg.com/leaflet@1.9.4/dist/images/layers.png         -o "$WWW/css/images/layers.png"
curl -sL https://unpkg.com/leaflet@1.9.4/dist/images/layers-2x.png      -o "$WWW/css/images/layers-2x.png"

echo "✅ www/ is ready — now run: cordova build android"
