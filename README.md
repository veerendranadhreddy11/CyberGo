# CyberNex

**Learn. Practice. Progress.**

CyberNex is a free cybersecurity learning app for Windows and macOS. It packages the curriculum, exercises, illustrations, quizzes, and progress tracking for offline study.

## Courses in the current source

| Course | Available lessons |
| --- | --- |
| **SOC Analyst · Blue Team** | Computer fundamentals, how computers work, file activity, security principles, the SOC alert workflow, and networking |
| **Red Team & Penetration Testing** | Computer fundamentals, how computers work, web page basics, security controls, assessment scope, and network endpoints |

Both courses are self-paced. Complete the current lesson to unlock the next one. The course overview shows published lesson counts and completed checks. Lessons include offline examples, definitions, guided practice, quizzes, and spaces to save notes and evidence.

Each path has six available lessons, beginning with What Is a Computer? The remaining beginner topics, labs, advanced modules, and capstones are in development. [Curriculum map and dependencies](docs/Curriculum_Rebuild.md)

The installers below are for the existing v2.1.0 release. Use the development instructions to try the current source.

## Install

| Platform | Native installer | ZIP with guide |
| --- | --- | --- |
| Windows x64 | [Setup EXE](https://github.com/veerendranadhreddy11/CyberNex/releases/download/v2.1.0/CyberNex-Setup-Windows-x64.exe) | [ZIP](https://github.com/veerendranadhreddy11/CyberNex/releases/download/v2.1.0/CyberNex-v2.1.0-Windows-x64.zip) |
| macOS Apple Silicon | [DMG](https://github.com/veerendranadhreddy11/CyberNex/releases/download/v2.1.0/CyberNex-macOS-AppleSilicon.dmg) | [ZIP](https://github.com/veerendranadhreddy11/CyberNex/releases/download/v2.1.0/CyberNex-v2.1.0-macOS-AppleSilicon.zip) |
| macOS Intel | [DMG](https://github.com/veerendranadhreddy11/CyberNex/releases/download/v2.1.0/CyberNex-macOS-Intel.dmg) | [ZIP](https://github.com/veerendranadhreddy11/CyberNex/releases/download/v2.1.0/CyberNex-v2.1.0-macOS-Intel.zip) |

[CyberNex v2.1.0 release](https://github.com/veerendranadhreddy11/CyberNex/releases/tag/v2.1.0) · [SHA-256 checksums](https://github.com/veerendranadhreddy11/CyberNex/releases/download/v2.1.0/SHA256SUMS.txt)

The targets are Windows 10 or 11 x64 and macOS 11 or later. See the [installation guide](docs/Installation_Guide.md) for signing and upgrade details.

## Progress and backups

Learning progress stays on the student's computer. In the installed app, **Settings → Export my data** creates a ZIP with both courses, historical records, quiz attempts, achievements, preferences, and evidence. Review the restore summary before confirming replacement. The **Learning archive** provides access to earlier notes, evidence, quiz history, activity charts, and reports. Prior completions keep their original identifiers.

## Development

Install Node.js 22 or later, stable Rust, Python 3, and the [Tauri system prerequisites](https://v2.tauri.app/start/prerequisites/).

```sh
npm ci
npm run lint
npm run typecheck
npm run validate
npm test
cargo test --manifest-path src-tauri/Cargo.toml --locked --no-default-features
npm run build
npx playwright install chromium
npm run test:browser
npm run desktop -- dev
```

Read the [architecture](docs/Architecture.md), [curriculum](docs/Curriculum_Rebuild.md), [testing report](docs/Testing_Report.md), [development report](docs/CyberNex_Development_Report.md), and [contribution guide](CONTRIBUTING.md). CyberNex uses the [MIT License](LICENSE).
