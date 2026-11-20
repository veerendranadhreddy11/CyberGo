#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use cybergo::store::{self, Backup, CourseState, Evidence, Progress, Store, Summary};
use serde::Serialize;
use std::{
    fs,
    path::{Path, PathBuf},
    sync::Mutex,
};
use tauri::{AppHandle, Manager, State};
use tauri_plugin_dialog::{DialogExt, FilePath};
use tauri_plugin_opener::OpenerExt;
use uuid::Uuid;

type Reply<T> = Result<T, String>;
struct Desktop {
    root: PathBuf,
    store: Mutex<Option<Store>>,
    pending: Mutex<Option<(String, Backup)>>,
}

impl Desktop {
    fn access<T>(&self, operation: impl FnOnce(&mut Store) -> store::Result<T>) -> Reply<T> {
        let mut state = self
            .store
            .lock()
            .map_err(|_| "Reopen CyberNex to recover the local workspace.")?;
        if state.is_none() {
            *state = Some(Store::open(self.root.clone()).map_err(message)?);
        }
        operation(state.as_mut().expect("initialized store")).map_err(message)
    }
}

fn message(error: store::Error) -> String {
    error.to_string()
}

fn path(selection: Option<FilePath>) -> Reply<Option<PathBuf>> {
    selection
        .map(|file| file.into_path().map_err(|_| "Choose a local file.".into()))
        .transpose()
}

fn safe_destination(state: &Desktop, destination: &Path) -> Reply<()> {
    let parent = destination
        .parent()
        .and_then(|path| path.canonicalize().ok())
        .ok_or("Choose an existing destination folder.")?;
    let root = state
        .root
        .canonicalize()
        .map_err(|_| "Could not locate CyberNex storage.")?;
    if parent.starts_with(root) {
        return Err("Choose a destination outside the CyberNex data folder.".into());
    }
    Ok(())
}

#[tauri::command]
async fn load_progress(state: State<'_, Desktop>) -> Reply<Progress> {
    state.access(|store| store.progress())
}

#[tauri::command]
async fn save_progress(state: State<'_, Desktop>, progress: Progress) -> Reply<()> {
    state.access(|store| store.save(&progress))
}

#[tauri::command]
async fn load_course(state: State<'_, Desktop>) -> Reply<CourseState> {
    state.access(|store| store.course())
}

#[tauri::command]
async fn save_course(state: State<'_, Desktop>, course: CourseState) -> Reply<()> {
    state.access(|store| store.save_course(&course))
}

#[tauri::command]
async fn read_motion_preference(state: State<'_, Desktop>) -> Reply<bool> {
    state.access(|store| store.reduced_motion())
}

#[tauri::command]
async fn write_motion_preference(state: State<'_, Desktop>, enabled: bool) -> Reply<()> {
    state.access(|store| store.set_reduced_motion(enabled))
}

#[tauri::command]
async fn list_evidence(state: State<'_, Desktop>, mission: Option<String>) -> Reply<Vec<Evidence>> {
    state.access(|store| store.evidence(mission.as_deref()))
}

#[tauri::command]
async fn attach_evidence(
    app: AppHandle,
    state: State<'_, Desktop>,
    mission: String,
) -> Reply<Vec<Evidence>> {
    let picked = app
        .dialog()
        .file()
        .add_filter(
            "Evidence",
            &[
                "png", "jpg", "jpeg", "webp", "gif", "pdf", "txt", "log", "csv", "json", "xml",
                "md", "pcap", "pcapng",
            ],
        )
        .blocking_pick_file();
    let Some(input) = path(picked)? else {
        return state.access(|store| store.evidence(Some(&mission)));
    };
    let name = input
        .file_name()
        .and_then(|name| name.to_str())
        .ok_or("The selected filename is unsupported.")?
        .to_owned();
    let file = fs::File::open(input).map_err(|_| "The selected file could not be opened.")?;
    let bytes = store::read_limited(file, 20 * 1024 * 1024).map_err(message)?;
    state.access(|store| {
        store.add(mission.clone(), name, &bytes)?;
        store.evidence(Some(&mission))
    })
}

#[tauri::command]
async fn delete_evidence(state: State<'_, Desktop>, id: String) -> Reply<()> {
    state.access(|store| store.remove(&id))
}

#[tauri::command]
async fn export_attachment(app: AppHandle, state: State<'_, Desktop>, id: String) -> Reply<()> {
    let (name, bytes) = state.access(|store| store.read(&id))?;
    if let Some(output) = path(app.dialog().file().set_file_name(name).blocking_save_file())? {
        safe_destination(&state, &output)?;
        store::export_evidence(&output, &bytes).map_err(message)?;
    }
    Ok(())
}

#[tauri::command]
async fn review_attachment(app: AppHandle, state: State<'_, Desktop>, id: String) -> Reply<()> {
    let (name, bytes) = state.access(|store| store.read(&id))?;
    let directory = state.root.join("review").join(id);
    fs::create_dir_all(&directory).map_err(|_| "Could not create the local review folder.")?;
    let output = directory.join(name);
    store::export_evidence(&output, &bytes).map_err(message)?;
    app.opener()
        .open_path(output.to_string_lossy(), None::<&str>)
        .map_err(|_| "No application could open this evidence file.".into())
}

#[tauri::command]
async fn open_data_folder(app: AppHandle, state: State<'_, Desktop>) -> Reply<()> {
    fs::create_dir_all(&state.root).map_err(|_| "Could not create the data folder.")?;
    app.opener()
        .open_path(state.root.to_string_lossy(), None::<&str>)
        .map_err(|_| "Could not open the data folder.".into())
}

#[tauri::command]
async fn open_official(app: AppHandle, url: String) -> Reply<()> {
    let sources = [
        "https://support.broadcom.com/",
        "https://www.microsoft.com/software-download/windows11",
        "https://ubuntu.com/download",
        "https://www.kali.org/get-kali/",
        "https://nmap.org/download.html",
        "https://www.wireshark.org/download.html",
        "https://documentation.wazuh.com/current/quickstart.html",
        "https://portswigger.net/burp/communitydownload",
        "https://www.python.org/downloads/",
        "https://learn.microsoft.com/sysinternals/downloads/sysmon",
    ];
    if !sources.contains(&url.as_str()) {
        return Err("This is not a bundled official download source.".into());
    }
    app.opener()
        .open_url(url, None::<&str>)
        .map_err(|_| "The default browser could not be opened.".into())
}

#[tauri::command]
async fn export_report(app: AppHandle, state: State<'_, Desktop>, bytes: Vec<u8>) -> Reply<bool> {
    if bytes.len() > 250_000 || !bytes.starts_with(b"%PDF-1.4\n") {
        return Err("Invalid progress report.".into());
    }
    let selected = app
        .dialog()
        .file()
        .add_filter("PDF report", &["pdf"])
        .set_file_name("CyberNex-progress.pdf")
        .blocking_save_file();
    let Some(output) = path(selected)? else {
        return Ok(false);
    };
    if output
        .extension()
        .and_then(|value| value.to_str())
        .is_none_or(|value| !value.eq_ignore_ascii_case("pdf"))
    {
        return Err("Choose a filename ending in .pdf.".into());
    }
    safe_destination(&state, &output)?;
    store::export_evidence(&output, &bytes).map_err(message)?;
    Ok(true)
}

#[tauri::command]
async fn export_backup(app: AppHandle, state: State<'_, Desktop>) -> Reply<bool> {
    let picked = app
        .dialog()
        .file()
        .add_filter("CyberNex backup", &["zip"])
        .set_file_name("CyberNex-backup.zip")
        .blocking_save_file();
    let Some(output) = path(picked)? else {
        return Ok(false);
    };
    safe_destination(&state, &output)?;
    state.access(|store| store.export(&output))?;
    Ok(true)
}

#[derive(Serialize)]
struct Preview {
    token: String,
    summary: Summary,
}

#[tauri::command]
async fn inspect_backup(app: AppHandle, state: State<'_, Desktop>) -> Reply<Option<Preview>> {
    let picked = app
        .dialog()
        .file()
        .add_filter("CyberNex backup", &["zip"])
        .blocking_pick_file();
    let mut pending = state
        .pending
        .lock()
        .map_err(|_| "Reopen CyberNex and try again.")?;
    *pending = None;
    let Some(input) = path(picked)? else {
        return Ok(None);
    };
    let backup = Backup::open(&input).map_err(message)?;
    let token = Uuid::new_v4().to_string();
    let summary = backup.summary();
    *pending = Some((token.clone(), backup));
    Ok(Some(Preview { token, summary }))
}

#[tauri::command]
async fn cancel_backup(state: State<'_, Desktop>) -> Reply<()> {
    *state
        .pending
        .lock()
        .map_err(|_| "Reopen CyberNex and try again.")? = None;
    Ok(())
}

#[tauri::command]
async fn restore_backup(state: State<'_, Desktop>, token: String) -> Reply<Progress> {
    let backup = {
        let mut pending = state
            .pending
            .lock()
            .map_err(|_| "Reopen CyberNex and try again.")?;
        if pending.as_ref().is_none_or(|(id, _)| id != &token) {
            return Err("Select and validate the backup again.".into());
        }
        pending.take().expect("validated pending backup").1
    };
    state.access(|store| store.restore(backup))
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let root = app.path().app_data_dir()?;
            let _ = fs::remove_dir_all(root.join("review"));
            app.manage(Desktop {
                root,
                store: Mutex::new(None),
                pending: Mutex::new(None),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_progress,
            save_progress,
            load_course,
            save_course,
            read_motion_preference,
            write_motion_preference,
            list_evidence,
            attach_evidence,
            delete_evidence,
            export_attachment,
            review_attachment,
            open_data_folder,
            export_backup,
            export_report,
            open_official,
            inspect_backup,
            restore_backup,
            cancel_backup
        ])
        .run(tauri::generate_context!())
        .expect("could not launch CyberNex");
}
