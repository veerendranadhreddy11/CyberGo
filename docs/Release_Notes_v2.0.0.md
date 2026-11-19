# CyberNex v2.0.0

CyberNex introduces a Full Cybersecurity Course with 41 self-paced lessons, module progress, Continue Learning, quizzes, evidence, and achievements. The original 240 SOC and Pentesting missions remain available in the 120-Day Crash Course.

The application keeps the CyberGo application data directory. The first launch adds a SQLite table for the Full Course while preserving the existing records. CyberGo v1 ZIPs can be restored into CyberNex. Use Settings to export a ZIP before an upgrade or move to another computer.

The Windows and Intel Mac packaging jobs test migration from the actual v1.0.0 application. The Apple Silicon package is cross-built on an Intel Mac, with disk-image, executable-architecture, and signing inspection. Apple Silicon startup is outside those checks.

Windows installers are unsigned. Mac builds use ad hoc signatures and lack Apple Developer ID notarization. Verify downloads using the published SHA-256 checksums.
