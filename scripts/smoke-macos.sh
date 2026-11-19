#!/usr/bin/env bash
set -euo pipefail
artifact="$1"
workdir="$(mktemp -d)"
mountpoint="$(mktemp -d)"
pid=""
cleanup() {
  if [[ -n "$pid" ]]; then kill "$pid" 2>/dev/null || true; fi
  hdiutil detach "$mountpoint" >/dev/null 2>&1 || true
  rm -rf "$mountpoint" "$workdir"
}
trap cleanup EXIT
database="$HOME/Library/Application Support/io.github.veerendranadhreddy11.cybergo/cybergo.db"

launch() {
  local image="$1" name="$2" version="$3" slot="$4"
  mkdir -p "$mountpoint"
  hdiutil attach "$image" -nobrowse -readonly -mountpoint "$mountpoint"
  local app="$workdir/$name-$slot.app"
  ditto "$mountpoint/$name.app" "$app"
  hdiutil detach "$mountpoint"
  local binary
  binary=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$app/Contents/Info.plist")
  "$app/Contents/MacOS/$binary" >"$workdir/app.log" 2>&1 &
  pid=$!
  for (( attempt=0; attempt<90; attempt++ )); do
    if ! kill -0 "$pid" 2>/dev/null; then cat "$workdir/app.log"; exit 1; fi
    if [[ -s "$database" ]] && [[ "$(python3 -c 'import sqlite3,sys;print(sqlite3.connect(sys.argv[1]).execute("PRAGMA user_version").fetchone()[0])' "$database")" == "$version" ]]; then
      kill "$pid"
      wait "$pid" 2>/dev/null || true
      pid=""
      return
    fi
    sleep 1
  done
  cat "$workdir/app.log"
  echo "The application did not initialize SQLite schema $version" >&2
  exit 1
}

old="$workdir/CyberNex-macOS-Intel.dmg"
curl --fail --location --retry 2 "https://github.com/$GITHUB_REPOSITORY/releases/download/v2.0.0/CyberNex-macOS-Intel.dmg" --output "$old"
launch "$old" CyberNex 2 prior
python3 scripts/upgrade-fixture.py seed "$database"
launch "$artifact" CyberNex 2 upgrade
python3 scripts/upgrade-fixture.py verify "$database"
