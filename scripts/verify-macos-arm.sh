#!/usr/bin/env bash
set -euo pipefail
image="$1"
mountpoint="$(mktemp -d)"
cleanup() {
  hdiutil detach "$mountpoint" >/dev/null 2>&1 || true
  rmdir "$mountpoint" 2>/dev/null || true
}
trap cleanup EXIT
hdiutil verify "$image"
hdiutil attach "$image" -nobrowse -readonly -mountpoint "$mountpoint"
bundle="$mountpoint/CyberNex.app"
binary=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$bundle/Contents/Info.plist")
lipo "$bundle/Contents/MacOS/$binary" -verify_arch arm64
codesign --display --verbose=2 "$bundle"
