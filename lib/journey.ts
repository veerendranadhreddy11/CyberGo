import { catalog } from "./catalog";
import { distance, parisDay } from "./dates";
import type { Day, Mission, Progress, Track } from "./types";

export const milestoneDays = [10, 30, 60, 90, 120];
export const missionCount = (state: Progress, track: Track) => catalog[track].filter(m => state.missions[m.id]?.completedAt).length;
export const nextMission = (state: Progress, track: Track): Mission | undefined => catalog[track].find(m => !state.missions[m.id]?.completedAt);
export const isScheduled = (state: Progress, today: Day) => Boolean(state.start && state.start > today);
export const calendarDays = (start: Day, end: Day) => Math.max(0, distance(start, end) + 1);
export function trackElapsed(state: Progress, track: Track, today: Day) {
  if (!state.start) return null;
  let end = today;
  if (missionCount(state, track) === 120) {
    end = catalog[track].map(m=>parisDay(new Date(state.missions[m.id]!.completedAt!))).sort().at(-1)!;
  }
  return end >= state.start ? calendarDays(state.start,end) : null;
}
