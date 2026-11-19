# CyberNex 2.1 testing report

| Check | Result |
| --- | --- |
| Catalog | The original 120 SOC and 120 Pentesting missions and 41 Full Course lessons are preserved. Overlay checks validate substantive fields, five four-option questions per item, and 240 distinct encouragement messages. |
| Local persistence | Rust tests cover legacy SQLite data, backup and restore, evidence retention, and invalid archives. |
| Frontend | Lint, type checking, production build, 12 unit tests, and seven Chromium tests passed. The browser suite exercised true Back navigation, independent same-day progress, a future start, quizzes, offline report export and final milestone badges. |
| PDF | A locally produced PDF was parsed successfully by pdftotext. |
| Backup portability | Windows exported a backup restored on macOS Intel, and macOS Intel exported a backup restored on Windows. Both directions retained the seeded mission quiz data, milestones, preferences, and evidence. [Workflow](https://github.com/veerendranadhreddy11/CyberGo/actions/runs/44611202971) |
| Windows x64 and macOS Intel | The release jobs launched v2.0, seeded synthetic SQLite records and evidence, launched v2.1, and checked that the fixture survived. Windows also checked that the installed app opened a window. [Release workflow](https://github.com/veerendranadhreddy11/CyberGo/actions/runs/44611103254) |
| macOS Apple Silicon | The ARM64 disk image was mounted, its executable architecture was confirmed, and its ad hoc signature was verified. A native Apple Silicon launch was outside this runner's coverage. |
| Public downloads | All seven release assets returned HTTP 200. All three downloaded ZIPs contained the matching installer and instructions. The archive and embedded installer hashes matched the published SHA-256 values. The v2.0.0 release artifact hashes were unchanged. [Published release](https://github.com/veerendranadhreddy11/CyberGo/releases/tag/v2.1.0) |
| Official sources | All ten vendor or project landing pages returned HTTP 200. This link check does not install the external tools. |
