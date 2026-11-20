# CyberNex testing report

## Two-course curriculum integration

| Check | Result |
| --- | --- |
| Validation | Lint, TypeScript checking, legacy catalog validation, and static production export passed. |
| TypeScript | 15 tests passed. The current registry has exactly two active courses, unique lesson IDs, verified quiz answer metadata, and prerequisites that point to earlier lessons in the same track. |
| Chromium | Six tests passed. Both tracks were completed end to end offline. A direct lesson link could not bypass its prerequisite. The suite also checked previous notes and quiz history, evidence-only records, a corrupt backup, mobile width, Back, and offline PDF export. |
| SQLite | Eight Rust tests passed. They include a version 1 migration, backup round trips, and restoring new records and attachments alongside earlier work. |
| Desktop packages | Windows x64 and Intel macOS built and passed upgrade checks with seeded records. The Apple Silicon job built and verified its disk image, ARM64 binary, and ad hoc signature on an Intel runner. Native Apple Silicon launch remains unverified. The release job was skipped. [Platform build](https://github.com/veerendranadhreddy11/CyberGo/actions/runs/44730788577) |

Eight lessons are available in the active application source. The separate intermediate and advanced samples were checked for meaningful content and valid quizzes. The intervening curriculum and independent capstone grading remain in development.

## CyberNex v2.1.0 release record

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
