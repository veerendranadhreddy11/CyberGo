# CyberNex

**Learn. Practice. Progress.**

CyberNex is a free cybersecurity learning app for Windows and macOS. It packages the curriculum, exercises, illustrations, quizzes, and progress tracking for offline study.

![CyberNex home with both learning modes](docs/screenshots/home.webp)

## Two ways to learn

| Mode | What you can do |
| --- | --- |
| **120-Day Crash Course** | Set a start date and follow 120 SOC Analyst missions and 120 Penetration Testing missions, each with its own checklist, evidence, and notes. Review older missions at any time. |
| **Full Cybersecurity Course** | Study 41 lessons across 10 modules at your own pace. Continue Learning opens the next incomplete lesson. Pick a priority module from the roadmap to change your sequence. |

Take knowledge checks, work through practical assessments, and track learning activity, module progress, skill areas, and achievements. Practice assessment methods using written scope, sanitized records, and defensive review in your authorized learning environment.

## Screenshots

| Crash Course | Full Course |
| --- | --- |
| ![Crash Course mission and progress dashboard](docs/screenshots/crash-course.webp) | ![Full Course dashboard with Continue Learning and module progress](docs/screenshots/full-course.webp) |
| ![SOC mission interface](docs/screenshots/soc.webp) | ![Pentesting mission interface](docs/screenshots/pentesting.webp) |
| ![Full Course roadmap](docs/screenshots/roadmap.webp) |  |

## Install

Find native installers, ZIP packages with installation instructions, and SHA-256 checksums in [GitHub Releases](https://github.com/veerendranadhreddy11/CyberGo/releases). The targets are Windows 10 or 11 x64, macOS Apple Silicon, and macOS Intel. See the [installation guide](docs/Installation_Guide.md) for setup and signing details.

## Progress and backups

Learning progress stays on the student's own computer and does not automatically synchronize between devices. Open **Settings → Export my data** for a ZIP containing both modes, quiz attempts, achievements, preferences, and evidence. Confirm replacement after reviewing the summary in **Import my data**. CyberGo users can upgrade in place. CyberNex uses the existing application data directory and can import older CyberGo ZIPs.

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

Read the [architecture](docs/Architecture.md), [curriculum](docs/Full_Course_Curriculum.md), [testing report](docs/Testing_Report.md), [development report](docs/CyberNex_Development_Report.md), and [contribution guide](CONTRIBUTING.md). CyberNex uses the [MIT License](LICENSE).
