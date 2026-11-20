use chrono::{DateTime, NaiveDate};
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::{
    collections::{BTreeMap, HashSet},
    fs::{self, File},
    io::{Read, Write},
    path::{Path, PathBuf},
    sync::OnceLock,
};
use tempfile::NamedTempFile;
use thiserror::Error;
use uuid::Uuid;
use zip::{write::SimpleFileOptions, ZipArchive, ZipWriter};

const MAX_ATTACHMENT: u64 = 20 * 1024 * 1024;
const MAX_MANIFEST: u64 = 150 * 1024 * 1024;
const MAX_BACKUP: u64 = 250 * 1024 * 1024;
const MAX_FILES: usize = 1000;

#[derive(Debug, Error)]
pub enum Error {
    #[error("The data file could not be accessed. Check available space and permissions.")]
    Io(#[from] std::io::Error),
    #[error("CyberNex could not read or write its SQLite data. Close other instances and retry.")]
    Db(#[from] rusqlite::Error),
    #[error("The backup or progress data is invalid.")]
    Json(#[from] serde_json::Error),
    #[error("The selected backup is not a readable CyberNex ZIP.")]
    Zip(#[from] zip::result::ZipError),
    #[error("{0}")]
    Invalid(&'static str),
}
pub type Result<T> = std::result::Result<T, Error>;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct MissionProgress {
    checks: Vec<usize>,
    notes: String,
    minutes: u32,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    studied_on: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    completed_at: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Progress {
    pub version: u8,
    pub start: Option<String>,
    pub missions: BTreeMap<String, MissionProgress>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Evidence {
    pub id: String,
    pub mission: String,
    pub name: String,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CourseState {
    records: BTreeMap<String, CourseRecord>,
    badges: BTreeMap<String, String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    preferred_module: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct CourseRecord {
    checks: Vec<u8>,
    notes: String,
    attempts: Vec<QuizAttempt>,
    completed_at: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct QuizAttempt {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    question: Option<usize>,
    choice: usize,
    score: u8,
    at: String,
}

fn quiz_catalog() -> &'static BTreeMap<String, Vec<(usize, usize)>> {
    static QUIZZES: OnceLock<BTreeMap<String, Vec<(usize, usize)>>> = OnceLock::new();
    QUIZZES.get_or_init(|| {
        [
            include_str!("../../curriculum/course-answers.json"),
            include_str!("../../curriculum/rebuild/answers.json"),
        ]
        .into_iter()
        .flat_map(|json| {
            serde_json::from_str::<BTreeMap<String, Vec<(usize, usize)>>>(json)
                .expect("bundled quiz answers")
        })
        .collect()
    })
}

impl CourseState {
    fn validate(&self) -> Result<()> {
        let quiz = quiz_catalog();
        if self.preferred_module.as_ref().is_some_and(|id| {
            id == "milestones"
                || !quiz
                    .keys()
                    .any(|key| key.split_once('/').is_some_and(|(module, _)| module == id))
        }) {
            return Err(Error::Invalid("Invalid preferred course module."));
        }
        let valid_date = |value: &str| DateTime::parse_from_rfc3339(value).is_ok();
        for (id, record) in &self.records {
            let questions = quiz
                .get(id)
                .ok_or(Error::Invalid("Unknown course lesson."))?;
            let unique: HashSet<_> = record.checks.iter().collect();
            if unique.len() != record.checks.len()
                || record.checks.iter().any(|check| *check > 1)
                || record.notes.encode_utf16().count() > 20_000
                || record.attempts.len() > 100
                || record.attempts.iter().any(|attempt| {
                    questions.get(attempt.question.unwrap_or(0)).is_none_or(
                        |&(correct, choices)| {
                            attempt.choice >= choices
                                || attempt.score != if attempt.choice == correct { 100 } else { 0 }
                                || !valid_date(&attempt.at)
                        },
                    )
                })
                || record
                    .completed_at
                    .as_deref()
                    .is_some_and(|at| unique.len() != 2 || !valid_date(at))
            {
                return Err(Error::Invalid("Invalid course progress."));
            }
        }
        if self.badges.iter().any(|(id, at)| {
            ![
                "first",
                "streak",
                "thirty",
                "soc",
                "pentest",
                "module",
                "network",
                "linux",
                "course",
                "soc-10",
                "soc-30",
                "soc-60",
                "soc-90",
                "soc-120",
                "pentest-10",
                "pentest-30",
                "pentest-60",
                "pentest-90",
                "pentest-120",
                "dual",
            ]
            .contains(&id.as_str())
                || !valid_date(at)
        }) {
            return Err(Error::Invalid("Invalid achievement history."));
        }
        Ok(())
    }
}

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Manifest {
    format: String,
    version: u8,
    progress: Progress,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    course: Option<CourseState>,
    preferences: BTreeMap<String, bool>,
    evidence: Vec<Evidence>,
}

pub struct Backup {
    manifest: Manifest,
    files: Vec<Vec<u8>>,
}

#[derive(Serialize)]
pub struct Summary {
    pub start: Option<String>,
    pub missions: usize,
    pub attachments: usize,
    pub lessons: usize,
}

pub struct Store {
    db: Connection,
    pub root: PathBuf,
}

fn catalog() -> &'static BTreeMap<String, usize> {
    static CATALOG: OnceLock<BTreeMap<String, usize>> = OnceLock::new();
    CATALOG.get_or_init(|| {
        #[derive(Deserialize)]
        struct Mission {
            id: String,
            checklist: Vec<String>,
        }
        [
            include_str!("../../curriculum/soc.json"),
            include_str!("../../curriculum/pentest.json"),
        ]
        .into_iter()
        .flat_map(|json| serde_json::from_str::<Vec<Mission>>(json).expect("bundled curriculum"))
        .map(|mission| (mission.id, mission.checklist.len()))
        .collect()
    })
}

fn date_ok(value: &str) -> bool {
    NaiveDate::parse_from_str(value, "%Y-%m-%d")
        .is_ok_and(|date| date.format("%Y-%m-%d").to_string() == value && value.len() == 10)
}

impl Progress {
    pub fn validate(&self) -> Result<()> {
        if self.version != 1 || self.start.as_deref().is_some_and(|date| !date_ok(date)) {
            return Err(Error::Invalid("Invalid journey date or progress version."));
        }
        for (id, record) in &self.missions {
            let count = *catalog()
                .get(id)
                .ok_or(Error::Invalid("Unknown mission."))?;
            let unique: HashSet<_> = record.checks.iter().collect();
            if unique.len() != record.checks.len()
                || record.checks.iter().any(|check| *check >= count)
                || record.notes.encode_utf16().count() > 100_000
                || record.minutes > 10_080
                || record
                    .studied_on
                    .as_deref()
                    .is_some_and(|date| !date_ok(date))
                || record.completed_at.as_deref().is_some_and(|date| {
                    record.checks.len() != count || DateTime::parse_from_rfc3339(date).is_err()
                })
            {
                return Err(Error::Invalid(
                    "A mission record contains invalid progress.",
                ));
            }
        }
        Ok(())
    }
}

fn permitted_name(name: &str) -> bool {
    if name.is_empty()
        || name.len() > 240
        || name.trim() != name
        || name
            .chars()
            .any(|c| c.is_control() || "\\/:*?\"<>|".contains(c))
    {
        return false;
    }
    let stem = name.split('.').next().unwrap_or("").to_ascii_uppercase();
    if matches!(stem.as_str(), "CON" | "PRN" | "AUX" | "NUL")
        || (stem.starts_with("COM") || stem.starts_with("LPT"))
            && stem.len() == 4
            && stem.as_bytes()[3].is_ascii_digit()
    {
        return false;
    }
    let extension = Path::new(name)
        .extension()
        .and_then(|extension| extension.to_str());
    matches!(
        extension.map(str::to_ascii_lowercase).as_deref(),
        Some(
            "png"
                | "jpg"
                | "jpeg"
                | "webp"
                | "gif"
                | "pdf"
                | "txt"
                | "log"
                | "csv"
                | "json"
                | "xml"
                | "md"
                | "pcap"
                | "pcapng"
        )
    )
}

fn validate_file(name: &str, bytes: &[u8]) -> Result<()> {
    if !permitted_name(name) || bytes.is_empty() || bytes.len() as u64 > MAX_ATTACHMENT {
        return Err(Error::Invalid(
            "Choose a supported evidence file between 1 byte and 20 MB.",
        ));
    }
    let extension = name.rsplit('.').next().unwrap_or("").to_ascii_lowercase();
    let valid = match extension.as_str() {
        "png" => bytes.starts_with(b"\x89PNG\r\n\x1a\n"),
        "jpg" | "jpeg" => bytes.starts_with(b"\xff\xd8\xff"),
        "webp" => bytes.starts_with(b"RIFF") && bytes.get(8..12) == Some(b"WEBP"),
        "gif" => bytes.starts_with(b"GIF87a") || bytes.starts_with(b"GIF89a"),
        "pdf" => bytes.starts_with(b"%PDF-"),
        "pcapng" => bytes.starts_with(&[0x0a, 0x0d, 0x0d, 0x0a]),
        "pcap" => matches!(
            bytes.get(..4),
            Some(
                [0xa1, 0xb2, 0xc3, 0xd4]
                    | [0xd4, 0xc3, 0xb2, 0xa1]
                    | [0xa1, 0xb2, 0x3c, 0x4d]
                    | [0x4d, 0x3c, 0xb2, 0xa1]
            )
        ),
        _ => !bytes.contains(&0) && std::str::from_utf8(bytes).is_ok(),
    };
    if !valid {
        return Err(Error::Invalid(
            "The file content does not match a supported evidence format.",
        ));
    }
    Ok(())
}

fn atomic_write(path: &Path, bytes: &[u8]) -> Result<()> {
    let parent = path
        .parent()
        .ok_or(Error::Invalid("Invalid destination."))?;
    let mut temp = NamedTempFile::new_in(parent)?;
    temp.write_all(bytes)?;
    temp.as_file().sync_all()?;
    temp.persist(path).map_err(|error| error.error)?;
    Ok(())
}

impl Store {
    pub fn open(root: PathBuf) -> Result<Self> {
        fs::create_dir_all(root.join("evidence"))?;
        let mut db = Connection::open(root.join("cybergo.db"))?;
        db.busy_timeout(std::time::Duration::from_secs(5))?;
        db.execute_batch("PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;")?;
        let transaction = db.transaction_with_behavior(rusqlite::TransactionBehavior::Immediate)?;
        let version: i64 = transaction.query_row("PRAGMA user_version", [], |row| row.get(0))?;
        match version {
            0 => {
                transaction.execute_batch(include_str!("../migrations/001_initial.sql"))?;
            }
            1 | 2 => {}
            _ => {
                return Err(Error::Invalid(
                    "This data was created by a newer version of CyberNex.",
                ))
            }
        }
        if version < 2 {
            transaction.execute_batch(include_str!("../migrations/002_course.sql"))?;
            transaction.pragma_update(None, "user_version", 2)?;
        }
        transaction.commit()?;
        Ok(Self { db, root })
    }

    pub fn course(&self) -> Result<CourseState> {
        let raw: String = self.db.query_row(
            "SELECT record_json FROM full_course_state WHERE id=1",
            [],
            |row| row.get(0),
        )?;
        let state: CourseState = serde_json::from_str(&raw)?;
        state.validate()?;
        Ok(state)
    }

    pub fn save_course(&mut self, course: &CourseState) -> Result<()> {
        course.validate()?;
        self.db.execute(
            "UPDATE full_course_state SET record_json=? WHERE id=1",
            [serde_json::to_string(course)?],
        )?;
        Ok(())
    }

    pub fn progress(&self) -> Result<Progress> {
        let start = self
            .db
            .query_row("SELECT start_day FROM settings WHERE id=1", [], |row| {
                row.get(0)
            })?;
        let mut statement = self
            .db
            .prepare("SELECT mission_id, record_json FROM mission_progress")?;
        let rows = statement.query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })?;
        let mut missions = BTreeMap::new();
        for row in rows {
            let (id, value) = row?;
            missions.insert(id, serde_json::from_str(&value)?);
        }
        Ok(Progress {
            version: 1,
            start,
            missions,
        })
    }

    pub fn save(&mut self, progress: &Progress) -> Result<()> {
        progress.validate()?;
        let transaction = self.db.transaction()?;
        Self::write_progress(&transaction, progress)?;
        transaction.commit()?;
        Ok(())
    }

    fn write_progress(transaction: &rusqlite::Transaction<'_>, progress: &Progress) -> Result<()> {
        transaction.execute(
            "UPDATE settings SET start_day=? WHERE id=1",
            [&progress.start],
        )?;
        transaction.execute("DELETE FROM mission_progress", [])?;
        let mut insert = transaction.prepare("INSERT INTO mission_progress VALUES (?, ?)")?;
        for (id, record) in &progress.missions {
            insert.execute(params![id, serde_json::to_string(record)?])?;
        }
        Ok(())
    }

    pub fn reduced_motion(&self) -> Result<bool> {
        let raw = self.db.query_row(
            "SELECT display_preferences FROM settings WHERE id=1",
            [],
            |row| row.get::<_, String>(0),
        )?;
        let values: BTreeMap<String, bool> = serde_json::from_str(&raw)?;
        Ok(values.get("reduceMotion").copied().unwrap_or(false))
    }

    pub fn set_reduced_motion(&mut self, enabled: bool) -> Result<()> {
        let bytes = serde_json::to_string(&BTreeMap::from([("reduceMotion", enabled)]))?;
        self.db.execute(
            "UPDATE settings SET display_preferences=? WHERE id=1",
            [bytes],
        )?;
        Ok(())
    }

    pub fn evidence(&self, mission: Option<&str>) -> Result<Vec<Evidence>> {
        let mut statement = self.db.prepare("SELECT id, mission_id, name FROM evidence WHERE ?1 IS NULL OR mission_id=?1 ORDER BY name, id")?;
        let rows = statement.query_map([mission], |row| {
            Ok(Evidence {
                id: row.get(0)?,
                mission: row.get(1)?,
                name: row.get(2)?,
            })
        })?;
        Ok(rows.collect::<std::result::Result<_, _>>()?)
    }

    fn evidence_path(&self, id: &str) -> Result<PathBuf> {
        if !Uuid::parse_str(id).is_ok_and(|uuid| uuid.to_string() == id) {
            return Err(Error::Invalid("Invalid evidence ID."));
        }
        Ok(self.root.join("evidence").join(id))
    }

    pub fn add(&mut self, mission: String, name: String, bytes: &[u8]) -> Result<Evidence> {
        if !catalog().contains_key(&mission) && !quiz_catalog().contains_key(&mission) {
            return Err(Error::Invalid("Unknown mission."));
        }
        validate_file(&name, bytes)?;
        let file = Evidence {
            id: Uuid::new_v4().to_string(),
            mission,
            name,
        };
        let path = self.evidence_path(&file.id)?;
        atomic_write(&path, bytes)?;
        if let Err(error) = self.db.execute(
            "INSERT INTO evidence VALUES (?, ?, ?)",
            params![file.id, file.mission, file.name],
        ) {
            let _ = fs::remove_file(path);
            return Err(error.into());
        }
        Ok(file)
    }

    pub fn read(&self, id: &str) -> Result<(String, Vec<u8>)> {
        let path = self.evidence_path(id)?;
        let name = self
            .db
            .query_row("SELECT name FROM evidence WHERE id=?", [id], |row| {
                row.get(0)
            })?;
        Ok((name, read_limited(File::open(path)?, MAX_ATTACHMENT)?))
    }

    pub fn remove(&mut self, id: &str) -> Result<()> {
        let path = self.evidence_path(id)?;
        if self.db.execute("DELETE FROM evidence WHERE id=?", [id])? != 0 {
            let _ = fs::remove_file(path);
            let _ = fs::remove_dir_all(self.root.join("review").join(id));
        }
        Ok(())
    }

    pub fn export(&self, path: &Path) -> Result<()> {
        let evidence = self.evidence(None)?;
        let preferences = self.db.query_row(
            "SELECT display_preferences FROM settings WHERE id=1",
            [],
            |row| row.get::<_, String>(0),
        )?;
        let manifest = Manifest {
            format: "CyberNex".into(),
            version: 2,
            progress: self.progress()?,
            course: Some(self.course()?),
            preferences: serde_json::from_str(&preferences)?,
            evidence,
        };
        if manifest.evidence.len() > MAX_FILES {
            return Err(Error::Invalid("Backups support up to 1,000 attachments."));
        }
        let destination = path
            .parent()
            .ok_or(Error::Invalid("Invalid backup destination."))?;
        let mut temp = NamedTempFile::new_in(destination)?;
        let mut zip = ZipWriter::new(temp.as_file_mut());
        let options = SimpleFileOptions::default();
        let manifest_bytes = serde_json::to_vec(&manifest)?;
        let mut total = manifest_bytes.len() as u64;
        if total > MAX_MANIFEST {
            return Err(Error::Invalid(
                "The progress manifest exceeds the supported size.",
            ));
        }
        zip.start_file("manifest.json", options)?;
        zip.write_all(&manifest_bytes)?;
        for file in &manifest.evidence {
            let (_, bytes) = self.read(&file.id)?;
            total += bytes.len() as u64;
            if total > MAX_BACKUP {
                return Err(Error::Invalid(
                    "Backup exceeds 250 MB. Export large evidence files separately.",
                ));
            }
            zip.start_file(format!("evidence/{}", file.id), options)?;
            zip.write_all(&bytes)?;
        }
        zip.finish()?;
        temp.as_file().sync_all()?;
        temp.persist(path).map_err(|error| error.error)?;
        Ok(())
    }

    pub fn restore(&mut self, backup: Backup) -> Result<Progress> {
        let restore_course = backup.manifest.course.is_some();
        let old: Vec<_> = self
            .evidence(None)?
            .into_iter()
            .filter(|item| restore_course || catalog().contains_key(&item.mission))
            .collect();
        let mut staged = Vec::new();
        let result = (|| {
            let mut references = Vec::new();
            for (file, bytes) in backup.manifest.evidence.into_iter().zip(backup.files) {
                let id = Uuid::new_v4().to_string();
                let path = self.evidence_path(&id)?;
                atomic_write(&path, &bytes)?;
                staged.push(path);
                references.push(Evidence { id, ..file });
            }
            let transaction = self.db.transaction()?;
            Self::write_progress(&transaction, &backup.manifest.progress)?;
            if let Some(course) = backup.manifest.course {
                transaction.execute(
                    "UPDATE full_course_state SET record_json=? WHERE id=1",
                    [serde_json::to_string(&course)?],
                )?;
            }
            transaction.execute(
                "UPDATE settings SET display_preferences=? WHERE id=1",
                [serde_json::to_string(&backup.manifest.preferences)?],
            )?;
            for file in &old {
                transaction.execute("DELETE FROM evidence WHERE id=?", [&file.id])?;
            }
            for file in references {
                transaction.execute(
                    "INSERT INTO evidence VALUES (?, ?, ?)",
                    params![file.id, file.mission, file.name],
                )?;
            }
            transaction.commit()?;
            Ok(backup.manifest.progress)
        })();
        if result.is_ok() {
            for file in old {
                if let Ok(path) = self.evidence_path(&file.id) {
                    let _ = fs::remove_file(path);
                    let _ = fs::remove_dir_all(self.root.join("review").join(file.id));
                }
            }
        } else {
            for path in staged {
                let _ = fs::remove_file(path);
            }
        }
        result
    }
}

pub fn read_limited(reader: impl Read, limit: u64) -> Result<Vec<u8>> {
    let mut bytes = Vec::new();
    reader.take(limit + 1).read_to_end(&mut bytes)?;
    if bytes.len() as u64 > limit {
        return Err(Error::Invalid(
            "The selected file exceeds the supported size.",
        ));
    }
    Ok(bytes)
}

pub fn export_evidence(path: &Path, bytes: &[u8]) -> Result<()> {
    atomic_write(path, bytes)
}

impl Backup {
    pub fn open(path: &Path) -> Result<Self> {
        let file = File::open(path)?;
        if file.metadata()?.len() > MAX_BACKUP + 1024 * 1024 {
            return Err(Error::Invalid("The backup exceeds the supported size."));
        }
        let mut archive = ZipArchive::new(file)?;
        if archive.is_empty() || archive.len() > MAX_FILES + 1 {
            return Err(Error::Invalid("Unexpected number of files in backup."));
        }
        let names: HashSet<_> = archive.file_names().map(str::to_owned).collect();
        if names.len() != archive.len() {
            return Err(Error::Invalid("Duplicate archive entries."));
        }
        let manifest_bytes = read_limited(archive.by_name("manifest.json")?, MAX_MANIFEST)?;
        let manifest: Manifest = serde_json::from_slice(&manifest_bytes)?;
        if !matches!(
            (
                manifest.format.as_str(),
                manifest.version,
                manifest.course.is_some()
            ),
            ("CyberGo", 1, false) | ("CyberNex", 2, true)
        ) || archive.len() != manifest.evidence.len() + 1
            || manifest.preferences.len() > 32
        {
            return Err(Error::Invalid(
                "Unsupported backup format or unexpected files.",
            ));
        }
        manifest.progress.validate()?;
        if let Some(course) = &manifest.course {
            course.validate()?;
        }
        let mut files = Vec::new();
        let mut total = manifest_bytes.len() as u64;
        let mut ids = HashSet::new();
        for file in &manifest.evidence {
            if !Uuid::parse_str(&file.id).is_ok_and(|uuid| uuid.to_string() == file.id)
                || !ids.insert(&file.id)
                || !(catalog().contains_key(&file.mission)
                    || (manifest.course.is_some() && quiz_catalog().contains_key(&file.mission)))
            {
                return Err(Error::Invalid("Invalid evidence metadata."));
            }
            let entry = archive.by_name(&format!("evidence/{}", file.id))?;
            if !entry.is_file()
                || entry
                    .unix_mode()
                    .is_some_and(|mode| mode & 0o170000 == 0o120000)
            {
                return Err(Error::Invalid("Unexpected file type in backup."));
            }
            let bytes = read_limited(entry, MAX_ATTACHMENT.min(MAX_BACKUP.saturating_sub(total)))?;
            total += bytes.len() as u64;
            validate_file(&file.name, &bytes)?;
            files.push(bytes);
        }
        Ok(Self { manifest, files })
    }

    pub fn summary(&self) -> Summary {
        Summary {
            start: self.manifest.progress.start.clone(),
            missions: self.manifest.progress.missions.len(),
            attachments: self.files.len(),
            lessons: self
                .manifest
                .course
                .as_ref()
                .map_or(0, |course| course.records.len()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn fixture() -> Progress {
        let mut missions = BTreeMap::new();
        for id in ["soc-1", "pentest-1"] {
            let complete = id == "soc-1";
            missions.insert(
                id.into(),
                MissionProgress {
                    checks: if complete {
                        (0..catalog()[id]).collect()
                    } else {
                        vec![0]
                    },
                    notes: format!("Synthetic {id} notes"),
                    minutes: if complete { 45 } else { 5 },
                    studied_on: Some("2026-11-19".into()),
                    completed_at: complete.then(|| "2026-11-19T10:30:00Z".into()),
                },
            );
        }
        Progress {
            version: 1,
            start: Some("2026-11-19".into()),
            missions,
        }
    }

    #[test]
    fn creates_migrates_and_reopens_database_with_independent_tracks() {
        let dir = tempfile::tempdir().unwrap();
        let root = dir.path().join("profile");
        let mut store = Store::open(root.clone()).unwrap();
        assert!(root.join("cybergo.db").is_file());
        assert!(store.progress().unwrap().missions.is_empty());
        store.save(&fixture()).unwrap();
        drop(store);
        let store = Store::open(root).unwrap();
        let saved = store.progress().unwrap();
        assert_eq!(saved.start.as_deref(), Some("2026-11-19"));
        assert!(saved.missions["soc-1"].completed_at.is_some());
        assert!(saved.missions["pentest-1"].completed_at.is_none());
        assert_eq!(saved.missions["soc-1"].minutes, 45);
        assert_eq!(
            saved.missions["pentest-1"].notes,
            "Synthetic pentest-1 notes"
        );
    }

    #[test]
    fn invalid_progress_is_rejected_without_replacing_records() {
        let dir = tempfile::tempdir().unwrap();
        let mut store = Store::open(dir.path().join("profile")).unwrap();
        let mut progress = fixture();
        store.save(&progress).unwrap();
        progress.start = Some("2026-02-30".into());
        assert!(store.save(&progress).is_err());
        progress.start = Some("2026-11-19".into());
        progress.missions.get_mut("soc-1").unwrap().checks = vec![0, 0];
        assert!(store.save(&progress).is_err());
        assert_eq!(
            store.progress().unwrap().missions["soc-1"].checks.len(),
            catalog()["soc-1"]
        );
    }

    #[test]
    fn backup_round_trip_restores_records_and_evidence_to_another_profile() {
        let dir = tempfile::tempdir().unwrap();
        let mut a = Store::open(dir.path().join("a")).unwrap();
        let mut b = Store::open(dir.path().join("b")).unwrap();
        a.save(&fixture()).unwrap();
        a.set_reduced_motion(true).unwrap();
        let file = a
            .add("soc-1".into(), "review.txt".into(), b"synthetic evidence")
            .unwrap();
        assert!(a.add("soc-1".into(), "../escape.txt".into(), b"x").is_err());
        assert!(a
            .add("soc-1".into(), "fake.pdf".into(), b"not PDF")
            .is_err());
        assert!(a.read("../../cybergo.db").is_err());
        let zip = dir.path().join("portable.zip");
        a.export(&zip).unwrap();
        let backup = Backup::open(&zip).unwrap();
        assert_eq!(backup.summary().missions, 2);
        assert_eq!(backup.summary().attachments, 1);
        let old = b
            .add("pentest-1".into(), "old.txt".into(), b"old evidence")
            .unwrap();
        b.restore(backup).unwrap();
        assert!(b.reduced_motion().unwrap());
        assert!(b.read(&old.id).is_err());
        let evidence = b.evidence(Some("soc-1")).unwrap().pop().unwrap();
        assert_ne!(evidence.id, file.id);
        assert_eq!(b.read(&evidence.id).unwrap().1, b"synthetic evidence");
        assert_eq!(
            b.progress().unwrap().missions["soc-1"].notes,
            "Synthetic soc-1 notes"
        );
        b.remove(&evidence.id).unwrap();
        assert!(b.evidence(None).unwrap().is_empty());
    }

    #[test]
    fn rejects_invalid_or_unexpected_zip_members() {
        let dir = tempfile::tempdir().unwrap();
        let zip = dir.path().join("invalid.zip");
        let mut writer = ZipWriter::new(File::create(&zip).unwrap());
        let manifest = Manifest {
            format: "CyberGo".into(),
            version: 1,
            progress: fixture(),
            course: None,
            preferences: BTreeMap::new(),
            evidence: vec![],
        };
        writer
            .start_file("manifest.json", SimpleFileOptions::default())
            .unwrap();
        writer
            .write_all(&serde_json::to_vec(&manifest).unwrap())
            .unwrap();
        writer
            .start_file("../unsafe.txt", SimpleFileOptions::default())
            .unwrap();
        writer.write_all(b"example").unwrap();
        writer.finish().unwrap();
        assert!(Backup::open(&zip).is_err());
        fs::write(&zip, b"this is not a zip file").unwrap();
        assert!(Backup::open(&zip).is_err());
    }
}

#[cfg(test)]
mod course_tests {
    use super::*;

    fn course() -> CourseState {
        serde_json::from_value(serde_json::json!({
            "records": {
                "computers/architecture": { "checks": [0, 1], "notes": "Course notes",
                    "attempts": [{"at":"2026-11-19T10:00:00Z", "choice":0, "score":100}], "completedAt":"2026-11-19T10:30:00Z" }
            },
            "badges": {"module":"2026-11-19T10:30:00Z"}
        })).unwrap()
    }

    #[test]
    fn review_progress_and_evidence_restore_alongside_existing_course_work() {
        let root = tempfile::tempdir().unwrap();
        let other = tempfile::tempdir().unwrap();
        let mut store = Store::open(root.path().join("profile")).unwrap();
        let mut saved = course();
        let id = "soc-rebuild/computer-first";
        let attempts = quiz_catalog()[id]
            .iter()
            .take(3)
            .enumerate()
            .map(|(question, &(choice, _))| QuizAttempt {
                question: Some(question),
                choice,
                score: 100,
                at: "2026-11-19T13:00:00Z".into(),
            })
            .collect();
        saved.records.insert(
            id.into(),
            CourseRecord {
                checks: vec![0, 1],
                notes: "Review batch evidence".into(),
                attempts,
                completed_at: Some("2026-11-19T13:05:00Z".into()),
            },
        );
        store.save_course(&saved).unwrap();
        store
            .add(id.into(), "report.txt".into(), b"synthetic record")
            .unwrap();
        let archive = root.path().join("review.zip");
        store.export(&archive).unwrap();
        let mut restored = Store::open(other.path().join("profile")).unwrap();
        restored.restore(Backup::open(&archive).unwrap()).unwrap();
        let loaded = restored.course().unwrap();
        assert_eq!(
            loaded.records["computers/architecture"].notes,
            "Course notes"
        );
        assert_eq!(loaded.records[id].notes, "Review batch evidence");
        assert_eq!(loaded.records[id].attempts.len(), 3);
        let attachments = restored.evidence(Some(id)).unwrap();
        assert_eq!(attachments.len(), 1);
        assert_eq!(
            restored.read(&attachments[0].id).unwrap().1,
            b"synthetic record"
        );
    }

    #[test]
    fn v1_database_upgrades_without_rewriting_existing_rows() {
        let directory = tempfile::tempdir().unwrap();
        let file = directory.path().join("cybergo.db");
        let db = Connection::open(&file).unwrap();
        db.execute_batch(include_str!("../migrations/001_initial.sql"))
            .unwrap();
        db.pragma_update(None, "user_version", 1).unwrap();
        db.execute("UPDATE settings SET start_day=? WHERE id=1", ["2026-11-19"])
            .unwrap();
        db.execute(
            "INSERT INTO mission_progress VALUES (?,?)",
            ["soc-1", r#"{"checks":[0],"notes":"v1 note","minutes":5}"#],
        )
        .unwrap();
        drop(db);
        let mut upgraded = Store::open(directory.path().to_path_buf()).unwrap();
        assert_eq!(
            upgraded.progress().unwrap().start.as_deref(),
            Some("2026-11-19")
        );
        assert_eq!(
            upgraded.progress().unwrap().missions["soc-1"].notes,
            "v1 note"
        );
        assert!(upgraded.course().unwrap().records.is_empty());
        upgraded.save_course(&course()).unwrap();
        drop(upgraded);
        let reopened = Store::open(directory.path().to_path_buf()).unwrap();
        assert_eq!(
            reopened.progress().unwrap().missions["soc-1"].notes,
            "v1 note"
        );
        assert_eq!(
            reopened.course().unwrap().records["computers/architecture"].notes,
            "Course notes"
        );
    }

    #[test]
    fn v2_backup_round_trips_course_and_legacy_restore_keeps_it() {
        let directory = tempfile::tempdir().unwrap();
        let mut first = Store::open(directory.path().join("first")).unwrap();
        let mut second = Store::open(directory.path().join("second")).unwrap();
        first.save_course(&course()).unwrap();
        first
            .add(
                "computers/architecture".into(),
                "course.txt".into(),
                b"synthetic",
            )
            .unwrap();
        let path = directory.path().join("modern.zip");
        first.export(&path).unwrap();
        second.restore(Backup::open(&path).unwrap()).unwrap();
        assert_eq!(second.course().unwrap().badges.len(), 1);
        assert_eq!(
            second.course().unwrap().records["computers/architecture"].attempts[0].score,
            100
        );
        let evidence = second.evidence(Some("computers/architecture")).unwrap();
        assert_eq!(evidence.len(), 1);
        let legacy = directory.path().join("legacy.zip");
        let mut writer = ZipWriter::new(File::create(&legacy).unwrap());
        writer
            .start_file("manifest.json", SimpleFileOptions::default())
            .unwrap();
        writer.write_all(br#"{"format":"CyberGo","version":1,"progress":{"version":1,"start":"2025-01-02","missions":{}},"preferences":{},"evidence":[]}"#).unwrap();
        writer.finish().unwrap();
        second.restore(Backup::open(&legacy).unwrap()).unwrap();
        assert_eq!(
            second.progress().unwrap().start.as_deref(),
            Some("2025-01-02")
        );
        assert_eq!(second.course().unwrap().records.len(), 1);
        assert_eq!(
            second
                .evidence(Some("computers/architecture"))
                .unwrap()
                .len(),
            1
        );
        let mut invalid = course();
        invalid
            .records
            .get_mut("computers/architecture")
            .unwrap()
            .attempts[0]
            .score = 1;
        assert!(second.save_course(&invalid).is_err());
    }
}
