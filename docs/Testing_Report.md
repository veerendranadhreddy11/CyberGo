# CyberNex testing report

| Check | Result |
| --- | --- |
| Original curriculum | 120 SOC and 120 Pentesting missions validated. Existing catalog files match the prior release. |
| Full Course | 41 lessons across ten modules and four optional Crash Course assessments validated. |
| Frontend checks | Lint, TypeScript, nine unit tests, and the production build passed. |
| Native storage tests | Six Rust unit tests and the backup portability test harness passed locally. |
| SQLite upgrade | A synthetic v1 database upgraded with its date, checklist, notes, and time intact. |
| Backup and evidence | Version 2 round-trip, legacy import preserving Full Course data, and unsafe ZIP rejection passed. |
| Offline local frontend | Five Chromium tests passed for both modes, saved quizzes, notes, priority module, completion, date handling, and offline artwork. |
| Windows installed upgrade | Passed on a Windows Server 2022 runner. A real CyberGo v1 installation upgraded to CyberNex with both tracks, journey date, notes, preferences, and evidence intact. |
| Intel macOS installed upgrade | Passed on Intel macOS 15. CyberNex opened the same app data after both disk images were exercised with a synthetic upgrade fixture. |
| Apple Silicon | Cross-built on Intel macOS. The ARM64 executable, mounted disk image, ad hoc signing metadata, and release ZIP passed verification. Native ARM startup remains unverified. |
| Cross-platform backup transfer | A version 2 backup was restored from Windows to macOS and macOS to Windows, including lesson progress, quiz score, preferred module, achievements, and evidence. [Backup workflow](https://github.com/veerendranadhreddy11/CyberGo/actions/runs/44550671555) |
| Public downloads | All seven assets responded publicly. Each platform ZIP was downloaded and its installer matched the standalone SHA-256 digest. The v1.0.0 release asset digests match the prior release. |

[Package workflow](https://github.com/veerendranadhreddy11/CyberGo/actions/runs/44552469585) · [Published release](https://github.com/veerendranadhreddy11/CyberGo/releases/tag/v2.0.0)
