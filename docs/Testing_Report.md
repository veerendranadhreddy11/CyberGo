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
| Native installers | See the release workflow for installed v1-to-v2 migration on Windows and Intel Mac and cross-build verification on Apple Silicon. |
