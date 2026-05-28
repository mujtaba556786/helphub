#!/usr/bin/env bash
# prepare-www.sh — syncs webapp → www/, applies mobile overrides, then builds APK
# Usage:  cd frontend/mobile && bash prepare-www.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEBAPP="$SCRIPT_DIR/../webapp"
WWW="$SCRIPT_DIR/www"

# ── Android SDK (Homebrew install) ──────────────────────────────────────────
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/35.0.0:$PATH"

# Create tools/bin symlink that older Cordova checks for
if [ ! -d "$ANDROID_HOME/tools/bin" ]; then
    mkdir -p "$ANDROID_HOME/tools"
    ln -sf "$ANDROID_HOME/cmdline-tools/latest/bin" "$ANDROID_HOME/tools/bin"
    echo "  Created tools/bin symlink"
fi

echo "▶ Syncing webapp → www/ ..."
rsync -a --delete \
    --exclude='test/' \
    --exclude='*.map' \
    "$WEBAPP/" "$WWW/"

echo "▶ Applying mobile-specific index.html ..."
cp "$SCRIPT_DIR/src/index.html" "$WWW/index.html"

echo "▶ Building APK ..."
cd "$SCRIPT_DIR"
cordova build android

echo ""
echo "✅ APK ready:"
find "$SCRIPT_DIR/platforms/android/app/build/outputs/apk" -name "*.apk" 2>/dev/null
