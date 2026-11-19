import { invoke, isTauri } from "@tauri-apps/api/core";
import { loadProgress, storeProgress } from "./progress";
import { emptyCourse, type CourseState } from "./course";
import type { Progress } from "./types";

export type NativeEvidence = { id: string; mission: string; name: string };
export type BackupPreview = { token: string; summary: { start: string | null; missions: number; attachments: number; lessons: number } };

// The browser adapter supports the standalone frontend preview and imported legacy JSON.
export const native = () => typeof window !== "undefined" && isTauri();
export async function readProgress() {
  return native() ? invoke<Progress>("load_progress") : loadProgress(localStorage);
}
export async function writeProgress(progress: Progress) {
  if (native()) await invoke("save_progress", { progress });
  else storeProgress(localStorage, progress);
}
export async function readCourse(): Promise<CourseState> {
  if (native()) return invoke<CourseState>("load_course");
  const value = localStorage.getItem("cybernex.course");
  return value ? JSON.parse(value) : emptyCourse();
}
export async function writeCourse(course: CourseState) {
  if (native()) await invoke("save_course", { course });
  else localStorage.setItem("cybernex.course", JSON.stringify(course));
}
export async function readReducedMotion() {
  return native() ? invoke<boolean>("read_motion_preference") : localStorage.getItem("cybergo.reduceMotion") === "true";
}
export async function writeReducedMotion(enabled: boolean) {
  if (native()) await invoke("write_motion_preference", { enabled });
  else localStorage.setItem("cybergo.reduceMotion", String(enabled));
}
export const desktop = {
  evidence: (mission: string) => invoke<NativeEvidence[]>("list_evidence", { mission }),
  attach: (mission: string) => invoke<NativeEvidence[]>("attach_evidence", { mission }),
  delete: (id: string) => invoke("delete_evidence", { id }),
  exportAttachment: (id: string) => invoke("export_attachment", { id }),
  review: (id: string) => invoke("review_attachment", { id }),
  openFolder: () => invoke("open_data_folder"),
  exportBackup: () => invoke<boolean>("export_backup"),
  inspect: () => invoke<BackupPreview | null>("inspect_backup"),
  cancel: () => invoke("cancel_backup"),
  restore: (token: string) => invoke<Progress>("restore_backup", { token }),
};

export function errorText(error: unknown) {
  return typeof error === "string" ? error : error instanceof Error ? error.message : "The local operation failed. Retry in CyberNex.";
}
