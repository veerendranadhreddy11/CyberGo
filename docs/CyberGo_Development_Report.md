# CyberGo development report

## Overview

CyberGo is an offline desktop companion for cybersecurity students. The desktop branch preserves the existing CyberMission 120 Next.js design and curriculum. It adds first-launch scheduling, native progress and evidence storage, and backups that can move between computers.

## Technology and desktop architecture

The frontend uses Next.js static export, React, TypeScript, custom CSS, Motion, and Recharts. Tauri 2 hosts the export in a native window. Rust commands implement storage, backup, and dialogs. No Supabase or ChatGPT Sites dependency ships in this checkout. The [architecture document](Architecture.md) describes the SQLite schema, migrations, and file handling.

## Curriculum and progress

The catalog contains two sets of 120 missions with stable IDs, practical instructions, checklists, and artifact requirements. SOC and Pentesting remain independently tracked. Scheduling uses a consistent Europe/Paris calendar. Changing its start date does not erase completion history, and past missions remain available after Day 120.

## Platform builds and installation

The release pipeline targets Windows x64 NSIS and macOS DMGs for Apple Silicon and Intel. ZIP wrappers add a short guide. The final release job verifies all six package files and their SHA-256 checksums before publication. See the [installation guide](Installation_Guide.md). The release workflow is configured to exercise installed startup on Windows and launch a copy from the mounted DMG on each Mac architecture.

## Testing and limitations

See the [testing report](Testing_Report.md) for executed checks and outstanding platform tests. Windows publisher signing and Apple notarization require separate credentials. Browser evidence must be copied manually when migrating from the website. Future work could add a visual evidence gallery and an option to select the study calendar time zone.
