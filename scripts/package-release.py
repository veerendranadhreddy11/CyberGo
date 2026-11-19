"""Wrap one native CyberNex package and verify the ZIP payload."""

import argparse
import shutil
import zipfile
from pathlib import Path

PLATFORMS = {
    "Windows-x64": ("x86_64-pc-windows-msvc", "nsis", "*-setup.exe", "CyberNex-Setup-Windows-x64.exe"),
    "macOS-AppleSilicon": ("aarch64-apple-darwin", "dmg", "*.dmg", "CyberNex-macOS-AppleSilicon.dmg"),
    "macOS-Intel": ("x86_64-apple-darwin", "dmg", "*.dmg", "CyberNex-macOS-Intel.dmg"),
}

parser = argparse.ArgumentParser()
parser.add_argument("platform", choices=PLATFORMS)
parser.add_argument("version")
args = parser.parse_args()

target, bundle, pattern, installer = PLATFORMS[args.platform]
files = list(Path("src-tauri/target", target, "release/bundle", bundle).glob(pattern))
if len(files) != 1 or not files[0].stat().st_size:
    raise SystemExit(f"Expected one nonempty {bundle} bundle for {target}")

release = Path("release")
release.mkdir(exist_ok=True)
package = release / installer
shutil.copyfile(files[0], package)
archive = release / f"CyberNex-v{args.version}-{args.platform}.zip"
with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as z:
    z.write(package, package.name)
    z.write("docs/Installation_Guide.md", "INSTALL.md")
with zipfile.ZipFile(archive) as z:
    if set(z.namelist()) != {package.name, "INSTALL.md"} or z.testzip() is not None:
        raise SystemExit("Release ZIP verification failed")
