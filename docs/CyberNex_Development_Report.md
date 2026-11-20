# CyberNex development report

## Current source

The two primary courses share the existing application shell and store progress under separate lesson identifiers. A prerequisite sequence advances independently in each track. Prior work lives in the learning archive, and eight beginner and foundation lessons are currently available. [Curriculum specification](Curriculum_Rebuild.md)

## v2.x release history

### Application upgrade

CyberNex extends the existing CyberGo Tauri, Next.js, React, and SQLite project. The Crash Course retains the original SOC and Pentesting catalogs and progress structures. The Full Course adds a deadline-free sequence, optional module prioritization, local quiz history, practical assessments, and tracked achievements.

### Immersive artwork

Original generated art depicts the command center, SOC, assessment workstation, learning lab, and each of the ten modules. The app bundles optimized WebP images and platform-specific shield icons. The README screenshots come from the running frontend on synthetic learner data.

### Migration and privacy

The Tauri identifier and application directory retain their CyberGo values. A versioned SQLite migration adds the course table alongside existing progress. The app includes an updated portable backup format and support for importing older data. [Architecture](Architecture.md)

### Verification and distribution

The project checks the original mission counts, Full Course structure, SQLite migration, and backup compatibility. Native installers come from the Windows and macOS release runners. Consult the [testing report](Testing_Report.md) for executed tests and limitations, and the [installation guide](Installation_Guide.md) for setup.

### CyberNex 2.1

Home gives SOC and Pentesting separate entry points above the Full Course. The Back button follows page history, including practice and evidence pages. Each mission sequence advances independently, even when several missions are completed on the same date. Learning reports use the original timestamps and can be exported as PDFs offline.

The original curriculum files and mission identifiers are retained. The offline teaching layer combines mission-specific material with shared tool and lab setup guides. Each mission and course lesson has five knowledge checks. The application keeps quiz attempts and milestones in the existing SQLite schema and portable backup format.

## Future work

Future releases can broaden the lesson question banks, add native Apple Silicon launch coverage, and adopt publisher signing and notarization.
