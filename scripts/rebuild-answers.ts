import { writeFileSync } from "node:fs";
import { reviewLessons } from "../lib/rebuild";

writeFileSync(new URL("../curriculum/rebuild/answers.json", import.meta.url),
  JSON.stringify(Object.fromEntries(reviewLessons.map(lesson => [
    lesson.id, lesson.questions.map(question => [question.correct, question.choices.length])
  ])), null, 2) + "\n");
