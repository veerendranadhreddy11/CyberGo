# CyberNex architecture

Tauri 2 embeds a static Next.js export. React renders the application and Recharts renders historical activity. The curriculum, images, examples, and quizzes are packaged locally.

## Current courses

The active registry contains SOC Analyst and Red Team & Penetration Testing. Each published module declares a prerequisite lesson in its own track. The first incomplete available lesson powers Continue Learning, and a direct link cannot bypass a prerequisite. Saved records use track-prefixed identifiers. An assessment sample outside the active dependency chain cannot appear as a published lesson.

Completion requires both activity checks, a saved note, and a passing latest attempt for every knowledge question. Published lesson counts measure learning activity. Independent practical mastery requires additional assessment.

## SQLite and backups

The application still uses `io.github.veerendranadhreddy11.cybergo`, its existing per-user `cybergo.db`, schema version 2, and the existing evidence directory. The existing JSON column stores stable lesson records and the quiz attempt history. Adding new registry IDs extends validation without moving records or requiring a new schema. Earlier records have distinct IDs and remain attached to their original evidence. No earlier completion is converted to credit automatically.

Settings opens the learning archive. Earlier lesson and mission URLs resolve to their archived records, including notes, evidence, progress, and historical quiz attempts. Historical activity and PDF reports remain available locally.

Version 2 ZIPs store lesson progress, earlier records, preferences, and evidence. Importing a prior archive remains supported. A current ZIP that contains new lesson IDs requires a build that recognizes them. The legacy browser JSON format continues to cover earlier mission records. The browser preview uses browser storage and exposes file downloads for evidence.

## Offline operation

The static frontend, diagrams, examples and quizzes work without authentication or remote services. Tauri uses narrow commands for local data, file dialogs and evidence management. The PDF writer builds from local progress, and the export excludes note contents and attachments.
