# CyberGo testing report

## Checks run

| Check | Result |
| --- | --- |
| Frontend lint and TypeScript type check | Passed |
| Curriculum validation | Passed for 120 SOC and 120 Pentesting missions. The mission files are unchanged from CyberMission 120. |
| Frontend unit tests | Seven passed. Coverage includes daylight saving, calendar boundaries, streaks, checklist rules, and browser JSON validation. |
| Rust storage tests | Four passed. Coverage includes SQLite creation and reopening, track independence, rejected progress, evidence validation, ZIP round-trip, and unsafe archive rejection. |
| Static production build | Passed |
| Chromium browser tests | Four passed. Coverage includes start confirmation, reload, offline notes, archive navigation, evidence, and legacy JSON restore. The browser tests use the standalone preview adapter. |
| GitHub Actions workflow lint | Passed |
| Native Tauri compilation check | Passed on Debian Linux with WebKitGTK using `cargo check --locked`. This check did not launch an installed application. |
| Release ZIP wrapper | Verified the named files and extraction integrity for synthetic Windows and macOS package fixtures. |

## Release verification

The release workflow includes Windows installation and macOS disk-image smoke checks on the two target architectures. The connected GitHub integration denied repository creation. No workflow run, platform package, cross-OS backup transfer, signed release, or public download was verified in this workspace.
