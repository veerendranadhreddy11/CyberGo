# CyberNex 2.1 testing report

| Check | Result |
| --- | --- |
| Catalog | The original 120 SOC and 120 Pentesting missions and 41 Full Course lessons are preserved. Overlay checks validate substantive fields, five four-option questions per item, and 240 distinct encouragement messages. |
| Local persistence | Rust tests cover legacy SQLite data, backup and restore, evidence retention, and invalid archives. |
| Frontend | Lint, type checking, production build, 12 unit tests, and seven Chromium tests passed. The browser suite exercised true Back navigation, independent same-day progress, a future start, quizzes, offline report export and final milestone badges. |
| PDF | A locally produced PDF was parsed successfully by pdftotext. |
| Published platform tests | Recorded after the release workflow completes. |
| Official sources | All ten vendor or project landing pages returned HTTP 200. This link check does not install the external tools. |
