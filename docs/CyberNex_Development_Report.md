# CyberNex development report

## Application upgrade

CyberNex extends the existing CyberGo Tauri, Next.js, React, and SQLite project. The Crash Course retains the original SOC and Pentesting catalogs and progress structures. The Full Course adds a deadline-free sequence, optional module prioritization, local quiz history, practical assessments, and tracked achievements.

## Immersive artwork

Original generated art depicts the command center, SOC, assessment workstation, learning lab, and each of the ten modules. The app bundles optimized WebP images and platform-specific shield icons. The README screenshots come from the running frontend on synthetic learner data.

## Migration and privacy

The Tauri identifier and application directory retain their CyberGo values. A versioned SQLite migration adds the course table alongside existing progress. The app includes an updated portable backup format and support for importing older data. [Architecture](Architecture.md)

## Verification and distribution

The project checks the original mission counts, Full Course structure, SQLite migration, and backup compatibility. Native installers come from the Windows and macOS release runners. Consult the [testing report](Testing_Report.md) for executed tests and limitations, and the [installation guide](Installation_Guide.md) for setup.

## Future work

Future releases can broaden the lesson question banks, add native Apple Silicon launch coverage, and adopt publisher signing and notarization.
