# CyberGo architecture

CyberGo packages the existing Next.js static export inside a Tauri 2 window. React and TypeScript provide the dashboard, track views, calendar, analytics, and Settings. CSS, charts, images, and the complete curriculum are bundled. The only application IPC calls concern local progress, preferences, evidence, backup, and file dialogs. The installed app uses Rust-backed storage. The standalone frontend preview uses browser storage for development and browser regression tests.

## Local storage

Tauri resolves the application-data directory using the identifier `io.github.veerendranadhreddy11.cybergo`. The app creates `cybergo.db` and `evidence/` under that directory. This normally means a directory under `%APPDATA%` on Windows or `~/Library/Application Support/` on macOS. SQLite uses WAL and FULL synchronization. The schema migrates under a versioned transaction.

| Table | Purpose |
| --- | --- |
| `settings` | Journey start date and display preferences |
| `mission_progress` | One validated record per mission ID, containing checklist, notes, study duration, study date, and completion timestamp |
| `evidence` | Attachment IDs, mission IDs, and validated display names |

Skill statistics, streaks, percentages, and charts are derived from those records. Dates use the existing Europe/Paris study calendar. Date arithmetic uses calendar-day differences independent of daylight-saving changes or a change to the OS time zone.

## Evidence and backups

Rust accepts an allowlisted evidence type at up to 20 MB, checks its basic content signature, and saves it under a UUID. Native dialogs choose import and export paths. Backup export writes a versioned manifest and attachments into one ZIP. Import validates every entry and its content before showing a summary. It reads exact entry names and never extracts archive paths. Restore stages newly named files before replacing records and references in one SQLite transaction. Old references remain valid if the transaction fails. A process interruption can leave an unreferenced file on disk. The database does not reference that file.

The single-instance desktop plugin prevents one CyberGo profile from being edited by two application processes. IPC has no shell command or arbitrary file read interface. The installed frontend has no cloud account or telemetry dependency.
