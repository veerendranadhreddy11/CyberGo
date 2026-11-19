import catalog from "../curriculum/full.json";
import type { Progress } from "./types";
import { activity, streaks } from "./progress";
import { parisDay } from "./dates";

export const modules = catalog.filter(module => module.id !== "milestones");
export const milestones = catalog.find(module => module.id === "milestones")!;
export const lessons = modules.flatMap(module => module.lessons);
export type Lesson = (typeof lessons)[number];
export type CourseRecord = { checks: number[]; notes: string; attempts: { at: string; choice: number; score: number }[]; completedAt?: string };
export type CourseState = { records: Record<string, CourseRecord>; badges: Record<string, string>; preferredModule?: string };
export const emptyCourse = (): CourseState => ({ records: {}, badges: {} });
export const emptyLesson = (): CourseRecord => ({ checks: [], notes: "", attempts: [] });
export const completed = (state: CourseState, lesson: Lesson) => Boolean(state.records[lesson.id]?.completedAt);
export function nextLesson(state: CourseState) {
  const preferred = modules.find(module => module.id === state.preferredModule);
  return preferred?.lessons.find(lesson => !completed(state, lesson)) ??
    lessons.find(lesson => !completed(state, lesson));
}
export const completeModule = (state: CourseState, module: (typeof modules)[number]) => module.lessons.every(lesson => completed(state, lesson));
export const lessonLink = (id: string) => "#/lesson/" + id;
export const badgeNames = {
  first: "First Mission Completed", streak: "7-Day Learning Streak", thirty: "30 Missions Completed",
  soc: "SOC Explorer", pentest: "Pentesting Explorer", module: "First Full Course Module",
  network: "Networking Fundamentals Completed", linux: "Linux Fundamentals Completed", course: "Full Course Milestone"
};
export const badgeDescriptions: Record<keyof typeof badgeNames, string> = {
  first: "Complete a Crash Course mission.", streak: "Study on seven consecutive days.",
  thirty: "Complete 30 Crash Course missions.", soc: "Complete five SOC missions.",
  pentest: "Complete five Pentesting missions.", module: "Complete any Full Course module.",
  network: "Complete Networking Fundamentals.", linux: "Complete Linux Fundamentals.", course: "Complete 20 Full Course lessons."
};
export function applyBadges(state: CourseState, crash: Progress, at = new Date().toISOString()) {
  const stats = activity(crash);
  const days = [...Object.keys(stats.minutesByDay), ...stats.completed.map(item => item.day)];
  for (const record of Object.values(state.records)) {
    if (record.completedAt) days.push(parisDay(new Date(record.completedAt)));
    for (const attempt of record.attempts) days.push(parisDay(new Date(attempt.at)));
  }
  const eligible: Record<keyof typeof badgeNames, boolean> = {
    first: stats.completed.length >= 1, streak: streaks(days, parisDay(new Date(at))).longest >= 7,
    thirty: stats.completed.length >= 30, soc: activity(crash, "soc").completed.length >= 5,
    pentest: activity(crash, "pentest").completed.length >= 5, module: modules.some(module => completeModule(state, module)),
    network: modules.some(module => module.id === "networking" && completeModule(state, module)),
    linux: modules.some(module => module.id === "linux" && completeModule(state, module)),
    course: lessons.filter(lesson => completed(state, lesson)).length >= 20
  };
  const unlocked = (Object.keys(eligible) as (keyof typeof eligible)[]).filter(key => eligible[key] && !state.badges[key]);
  return unlocked.length ? { ...state, badges: { ...state.badges, ...Object.fromEntries(unlocked.map(key => [key, at])) } } : state;
}
