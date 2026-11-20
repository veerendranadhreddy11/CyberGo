import { representativeLessons, type RebuildLesson } from "../curriculum/rebuild/representative";
import { foundationLessons } from "../curriculum/rebuild/foundations";
import { orientationLessons } from "../curriculum/rebuild/orientation";
import { networkingLessons } from "../curriculum/rebuild/networking";
import type { CourseState, CourseRecord } from "./course";

export const rebuildTracks = [
  { id: "soc", name: "SOC Analyst", team: "Blue Team" },
  { id: "pentest", name: "Red Team & Penetration Testing", team: "Penetration Testing" }
] as const;

export const primaryCourses = rebuildTracks.map(track => {
  const beginner = representativeLessons.find(lesson => lesson.track === track.id && lesson.level === "Absolute Beginner")!;
  const [foundation] = foundationLessons.filter(lesson => lesson.track === track.id);
  const [orientation] = orientationLessons.filter(lesson => lesson.track === track.id);
  const intro = track.id === "soc" ? [beginner, foundation, orientation] : [beginner, orientation, foundation];
  const ordered = [...intro, ...networkingLessons.filter(lesson => lesson.track === track.id)];
  const modules = ordered.map((lesson, index) => ({
    id: lesson.id, title: lesson.module, lesson, requires: ordered[index - 1]?.id,
  }));
  return { ...track, modules };
});

export const courseLessons = primaryCourses.flatMap(course => course.modules.map(module => module.lesson));
export const reviewLessons = [...courseLessons, ...representativeLessons.filter(lesson => lesson.level !== "Absolute Beginner")];
export const courseProgress = (course: (typeof primaryCourses)[number], state: CourseState) => ({
  completed: course.modules.filter(module => state.records[module.id]?.completedAt).length,
  next: course.modules.find(module => !state.records[module.id]?.completedAt && (!module.requires || state.records[module.requires]?.completedAt)),
});

export const rebuildPath = (lesson: RebuildLesson) => `#/learning/${lesson.track}/${lesson.id.split("/")[1]}`;

export function canCompleteRebuildLesson(lesson: RebuildLesson, record: CourseRecord) {
  return record.checks.includes(0) && record.checks.includes(1) && Boolean(record.notes.trim()) &&
    lesson.questions.every((_, index) =>
      record.attempts.filter(attempt => attempt.question === index).at(-1)?.score === 100);
}
