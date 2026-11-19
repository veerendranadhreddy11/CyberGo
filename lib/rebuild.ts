import { representativeLessons, type RebuildLesson } from "../curriculum/rebuild/representative";
import { foundationLessons } from "../curriculum/rebuild/foundations";
import type { CourseRecord } from "./course";

export const rebuildTracks = [
  { id: "soc", name: "SOC Analyst", team: "Blue Team" },
  { id: "pentest", name: "Red Team", team: "Penetration Testing" }
] as const;

export const reviewLessons = rebuildTracks.flatMap(({ id }) => {
  const [first, ...samples] = representativeLessons.filter(lesson => lesson.track === id);
  return [first, ...foundationLessons.filter(lesson => lesson.track === id), ...samples];
});

export const rebuildPath = (lesson: RebuildLesson) => `#/learning/${lesson.track}/${lesson.id.split("/")[1]}`;

export function canCompleteRebuildLesson(lesson: RebuildLesson, record: CourseRecord) {
  return record.checks.includes(0) && record.checks.includes(1) && Boolean(record.notes.trim()) &&
    lesson.questions.every((_, index) =>
      record.attempts.filter(attempt => attempt.question === index).at(-1)?.score === 100);
}
