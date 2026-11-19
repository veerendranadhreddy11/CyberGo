import { addDays, isDay, parisDay } from "./dates";
import { getMission } from "./catalog";
import type { Day, Mission, MissionId, MissionProgress, Progress, Track } from "./types";

export const freshProgress = (): Progress => ({ version: 1, start: null, missions: {} });
export const freshMission = (): MissionProgress => ({ checks: [], notes: "", minutes: 0 });
export function percent(value: number, total: number) {
  const ratio = total ? value / total * 100 : 0;
  return ratio > 0 && ratio < 1 ? Math.round(ratio * 100) / 100 : Math.round(ratio);
}
export const checklistPercent = (progress: MissionProgress | undefined, mission: Mission) => percent(progress?.checks.length ?? 0, mission.checklist.length);
export function finishMission(progress: Progress, mission: Mission, at = new Date()): Progress {
  const current = progress.missions[mission.id];
  if (!current || current.completedAt || !mission.checklist.every((_, index) => current.checks.includes(index))) return progress;
  return { ...progress, missions: { ...progress.missions, [mission.id]: { ...current, completedAt: at.toISOString() } } };
}
export function status(entry: MissionProgress | undefined, day: number, currentDay: number) {
  if (entry?.completedAt) return "Completed";
  if (entry && (entry.checks.length || entry.notes.trim() || entry.minutes)) return "In progress";
  if (day < currentDay) return "Pending";
  if (day > currentDay) return "Upcoming";
  return "Ready to start";
}
export function parseBackup(text: string): Progress {
  const raw = JSON.parse(text);
  if (!raw || raw.version !== 1 || !(raw.start === null || isDay(raw.start)) ||
      !raw.missions || typeof raw.missions !== "object" || Array.isArray(raw.missions)) throw new Error("Choose a valid CyberGo or CyberMission 120 JSON backup.");
  const result: Progress = { version: 1, start: raw.start, missions: {} };
  for (const [key, value] of Object.entries(raw.missions)) {
    const match = /^(soc|pentest)-(\d+)$/.exec(key);
    const mission = match && getMission(match[1] as Track, Number(match[2]));
    const entry = value as MissionProgress;
    if (!mission || mission.id !== key || !entry || typeof entry !== "object" ||
        !Array.isArray(entry.checks) || new Set(entry.checks).size !== entry.checks.length ||
        !entry.checks.every((i) => Number.isInteger(i) && i >= 0 && i < mission.checklist.length) ||
        typeof entry.notes !== "string" || entry.notes.length > 100_000 ||
        !Number.isInteger(entry.minutes) || entry.minutes < 0 || entry.minutes > 10080 ||
        (entry.studiedOn !== undefined && !isDay(entry.studiedOn)) ||
        (entry.completedAt !== undefined && (
          typeof entry.completedAt !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(entry.completedAt) ||
          !isDay(entry.completedAt.slice(0, 10)) || !Number.isFinite(Date.parse(entry.completedAt)) || entry.checks.length !== mission.checklist.length
        ))) throw new Error(`Invalid saved mission: ${key}.`);
    result.missions[mission.id] = { checks: entry.checks, notes: entry.notes, minutes: entry.minutes, studiedOn: entry.studiedOn, completedAt: entry.completedAt };
  }
  return result;
}
export const storageKey = "cybermission120.progress.v1";
export function loadProgress(storage: Pick<Storage, "getItem">): Progress {
  const saved = storage.getItem(storageKey);
  return saved === null ? freshProgress() : parseBackup(saved);
}
export function storeProgress(storage: Pick<Storage, "setItem">, progress: Progress) {
  storage.setItem(storageKey, JSON.stringify(progress));
}
export function activity(progress: Progress, track?: Track) {
  const entries = Object.entries(progress.missions) as [MissionId, MissionProgress][];
  const scoped = track ? entries.filter(([id]) => id.startsWith(track + "-")) : entries;
  const completed = scoped.flatMap(([id, value]) => value.completedAt
    ? [{ id, track: id.split("-")[0] as Track, day: parisDay(new Date(value.completedAt)), at: value.completedAt }]
    : []).sort((a, b) => b.at.localeCompare(a.at));
  const minutesByDay: Record<Day, number> = {};
  for (const [, item] of scoped) {
    const date = item.studiedOn ?? (item.completedAt ? parisDay(new Date(item.completedAt)) : undefined);
    if (date && item.minutes) minutesByDay[date] = (minutesByDay[date] ?? 0) + item.minutes;
  }
  return { completed, minutesByDay, minutes: scoped.reduce((sum, [, p]) => sum + p.minutes, 0) };
}
export function streaks(dates: Day[], today: Day) {
  const keys = [...new Set(dates.filter((date) => date <= today))].sort();
  let longest = 0;
  let run = 0;
  let previous = "";
  for (const date of keys) {
    run = previous && addDays(previous, 1) === date ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = date;
  }
  return { current: (previous === today || previous === addDays(today, -1)) ? run : 0, longest };
}
