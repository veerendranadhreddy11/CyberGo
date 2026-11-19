use cybergo::store::{Backup, CourseState, Progress, Store};
use serde_json::json;
use std::path::PathBuf;

#[test]
fn exchange_synthetic_backup() {
    let produce = std::env::var_os("CYBERGO_PORTABLE_PRODUCE").map(PathBuf::from);
    let consume = std::env::var_os("CYBERGO_PORTABLE_CONSUME").map(PathBuf::from);
    if produce.is_none() && consume.is_none() {
        return;
    }

    let directory = tempfile::tempdir().unwrap();
    let mut store = Store::open(directory.path().join("profile")).unwrap();
    let notes = "Synthetic cross-platform progress";
    let evidence = b"Synthetic evidence from a native runner";
    let name = "SOC résumé.txt";

    if let Some(path) = produce {
        let progress: Progress = serde_json::from_value(json!({
            "version": 1, "start": "2026-11-19",
            "missions": { "soc-1": { "checks": [0], "notes": notes, "minutes": 40 } }
        }))
        .unwrap();
        store.save(&progress).unwrap();
        let course: CourseState = serde_json::from_value(json!({
            "records": { "computers/architecture": { "checks": [0, 1], "notes": "Course practice",
                "attempts": [{"at":"2026-11-19T10:00:00Z","choice":0,"score":100}],
                "completedAt":"2026-11-19T11:00:00Z" } },
            "badges": { "module":"2026-11-19T11:00:00Z" },
            "preferredModule": "networking"
        }))
        .unwrap();
        store.save_course(&course).unwrap();
        store.set_reduced_motion(true).unwrap();
        store.add("soc-1".into(), name.into(), evidence).unwrap();
        store.export(&path).unwrap();
    }

    if let Some(path) = consume {
        let backup = Backup::open(&path).unwrap();
        assert_eq!(backup.summary().attachments, 1);
        assert_eq!(backup.summary().lessons, 1);
        store.restore(backup).unwrap();
        assert!(store.reduced_motion().unwrap());
        let saved = serde_json::to_value(store.progress().unwrap()).unwrap();
        assert_eq!(saved["start"], "2026-11-19");
        assert_eq!(saved["missions"]["soc-1"]["notes"], notes);
        assert_eq!(saved["missions"]["soc-1"]["minutes"], 40);
        let course = serde_json::to_value(store.course().unwrap()).unwrap();
        assert_eq!(
            course["records"]["computers/architecture"]["notes"],
            "Course practice"
        );
        assert_eq!(
            course["records"]["computers/architecture"]["attempts"][0]["score"],
            100
        );
        assert_eq!(course["badges"]["module"], "2026-11-19T11:00:00Z");
        assert_eq!(course["preferredModule"], "networking");
        let file = store.evidence(Some("soc-1")).unwrap().pop().unwrap();
        assert_eq!(file.name, name);
        assert_eq!(store.read(&file.id).unwrap().1, evidence);
    }
}
