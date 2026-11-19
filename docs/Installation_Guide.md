# Installing CyberGo 1.0.0

## Windows 10 or 11, x64

1. Download `CyberGo-v1.0.0-Windows-x64.zip` from the repository’s Releases tab when available.
2. Extract the ZIP and run `CyberGo-Setup-Windows-x64.exe`.
3. Complete the current-user setup and open **CyberGo** from Start. If offered, select the desktop shortcut option. You may also create a desktop shortcut from the installed Start entry.
4. Choose and confirm your journey date.

The installer is configured to carry the offline Microsoft Edge WebView2 runtime installer for systems that need it. Windows may show a publisher or SmartScreen warning for an unsigned build. Follow your device’s security policy and verify the checksum.

## macOS 11 or later

1. Choose the Apple Silicon or Intel ZIP for your Mac and extract it.
2. Open the corresponding DMG and drag **CyberGo** into **Applications**.
3. Launch CyberGo and choose your start date.

The pipeline is configured for ad hoc macOS signing. It does not provide Apple Developer ID signing or notarization. Gatekeeper or managed-device policy may prevent launch. Use an approved signed and notarized build if your policy requires one.

## Local files and updates

Use **Settings → Open data folder** to locate the per-user SQLite database and evidence. CyberGo installs separately from these files. Export a ZIP backup before updating or uninstalling, and keep a copy away from the computer. You can restore it on another supported computer. The restore replaces that installation’s current records and evidence.
