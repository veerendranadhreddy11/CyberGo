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
| Windows x64 installed-package smoke test | Passed on the GitHub Windows Server 2022 runner. The NSIS-installed program opened a window and created its SQLite database. |
| Intel macOS disk-image startup | Passed on an Intel macOS 15 runner. The app copied from the mounted DMG started and created its SQLite database. |
| Windows ↔ macOS backup transfer | Passed both directions on Windows Server 2022 and Intel macOS 15 runners using synthetic notes, preferences, and Unicode-named evidence. [Workflow result](https://github.com/veerendranadhreddy11/CyberGo/actions/runs/44499230046) |
| Release ZIP wrapper | Verified the named files and extraction integrity for synthetic Windows and macOS package fixtures. |

## Release verification

The public source repository, v1.0.0 tag, and verified Windows x64 and Intel macOS packages are live. The published ZIPs were independently downloaded and their embedded installers matched the standalone release digests. [Release](https://github.com/veerendranadhreddy11/CyberGo/releases/tag/v1.0.0)

The native Apple Silicon runner was unavailable. The [Apple Silicon cross-build](https://github.com/veerendranadhreddy11/CyberGo/actions/runs/44504039399) is verifying the ARM64 package before publication.
