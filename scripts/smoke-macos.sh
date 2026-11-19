#!/usr/bin/env bash
set -euo pipefail
artifact="$1"
mountpoint="$(mktemp -d)"
workdir="$(mktemp -d)"
pid=""
cleanup() {
  if [[ -n "$pid" ]]; then kill "$pid" 2>/dev/null || true; fi
  hdiutil detach "$mountpoint" >/dev/null 2>&1 || true
  rm -rf "$mountpoint" "$workdir"
}
trap cleanup EXIT
hdiutil attach "$artifact" -nobrowse -readonly -mountpoint "$mountpoint"
ditto "$mountpoint/CyberGo.app" "$workdir/CyberGo.app"
app="$workdir/CyberGo.app"
binary=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$app/Contents/Info.plist")
"$app/Contents/MacOS/$binary" >"$workdir/app.log" 2>&1 &
pid=$!
database="$HOME/Library/Application Support/io.github.veerendranadhreddy11.cybergo/cybergo.db"
for (( attempt=0; attempt<60; attempt++ )); do
  if ! kill -0 "$pid" 2>/dev/null; then cat "$workdir/app.log"; exit 1; fi
  if [[ -s "$database" ]]; then exit 0; fi
  sleep 1
done
cat "$workdir/app.log"
echo "The macOS application did not create its SQLite database" >&2
exit 1
