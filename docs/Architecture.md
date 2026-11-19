# CyberNex architecture

The Tauri 2 desktop shell embeds a static Next.js export. React and TypeScript provide the interface, Recharts renders local activity and skills graphics, and Motion handles lightweight page transitions. The frontend, catalog, images, and quizzes are packaged in the application and available offline.

## Two learning modes

The Crash Course uses the original `soc-N` and `pentest-N` mission IDs. Its date controls only the 120-day schedule. The Full Course uses stable `module/lesson` IDs with a separate record per lesson or optional assessment. Continue Learning chooses the first incomplete lesson in the selected priority module, then follows the standard progression.

## SQLite migration and backup

Tauri retains the application identifier `io.github.veerendranadhreddy11.cybergo`. The original `cybergo.db` and `evidence/` remain in the per-user app data directory. Schema migration 002 creates the separate `full_course_state` table in an immediate transaction. Mission progress, scheduling, preferences, and evidence records continue to use their original tables.

The new table stores checks, notes, completion timestamps, quiz attempts and scores, badge history, and the optional priority module. Charts derive from saved completion and activity dates. The skills radar measures curriculum progress.

ZIP format 2 contains both modes, preferences, and evidence. Format 1 CyberGo ZIPs restore their original records while keeping current Full Course learning records and lesson evidence. Evidence attachments are validated, stored under local UUIDs, and copied into verified ZIPs without extracting arbitrary paths. Restore stages files and commits references transactionally. The older browser JSON importer restores the Crash Course only.

## Offline security

Tauri exposes narrow commands for progress, preferences, native user-selected files, and validated backups. The application never executes course commands. Evidence stays in the application data directory. PNG-derived WebP backgrounds and platform icons ship locally. The optional standalone browser preview stores its development state in browser storage.

## Sequential practice and reports

The first incomplete mission determines the position in each track. The selected start date remains the availability gate for marking missions done, and a prior mission must be complete before the next mission can be completed. Calendar dates come from the original completion timestamps. Elapsed time uses Europe/Paris dates and counts both the start date and end date. A finished track uses its last saved completion date.

Quiz attempts use the existing course state with an optional zero-based question index. Earlier attempts without the field still refer to question one. The SQLite identifier, tables, and evidence paths are unchanged. A version 2 backup includes these attempts automatically. Open backups containing new question indexes in CyberNex 2.1 or later.

The PDF writer uses local progress and achievement data. It excludes private note contents and evidence attachments. The native save dialog writes only to a user-selected PDF destination. Official tool links open the system browser only when selected and are checked against the bundled source list.
