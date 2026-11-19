import assert from "node:assert/strict";
import { test } from "node:test";
import { reviewLessons } from "../lib/rebuild";
import answers from "../curriculum/rebuild/answers.json";
import legacyAnswers from "../curriculum/course-answers.json";
import { emptyLesson } from "../lib/course";
import { canCompleteRebuildLesson, rebuildPath, rebuildTracks } from "../lib/rebuild";

test("each review track contains a beginner lesson, intermediate lab, and advanced assessment", () => {
  assert.deepEqual(rebuildTracks.map(track => track.id), ["soc", "pentest"]);
  assert.equal(new Set(reviewLessons.map(lesson => rebuildPath(lesson))).size, 8);
  assert.equal(new Set(reviewLessons.map(lesson => lesson.encouragement)).size, 8);
  for (const { id } of rebuildTracks) {
    assert.deepEqual(reviewLessons.filter(lesson => lesson.track === id).map(lesson => lesson.level),
      ["Absolute Beginner", "Absolute Beginner", "Intermediate", "Advanced"]);
  }
  assert.deepEqual(Object.keys(answers).sort(), reviewLessons.map(lesson => lesson.id).sort());
  for (const lesson of reviewLessons) {
    assert.ok(!(lesson.id in legacyAnswers));
    assert.ok(lesson.theory.length >= 3 && lesson.theory.every(paragraph => paragraph.length > 130));
    assert.ok(lesson.terms.length >= 3 && lesson.steps.length >= 4 && lesson.flow.length >= 3);
    for (const section of [lesson.preparation, lesson.fixture, lesson.independent, lesson.expected,
      lesson.troubleshoot, lesson.evidence, lesson.summary]) assert.ok(section.length > 70, lesson.id);
    for (const question of lesson.questions) {
      assert.equal(new Set(question.choices).size, 4);
      assert.ok(question.choices[question.correct] && question.explanation.length > 45);
    }
    assert.deepEqual(answers[lesson.id as keyof typeof answers],
      lesson.questions.map(question => [question.correct, question.choices.length]));
  }
});

test("review completion requires the practical record, checklist, and a passing latest attempt per question", () => {
  for (const lesson of reviewLessons) {
    const attempts = lesson.questions.map((question, index) => ({
      question: index, choice: question.correct, score: 100, at: "2026-11-19T18:00:00Z"
    }));
    const record = { ...emptyLesson(), notes: "My evidence review", checks: [0, 1], attempts };
    assert.equal(canCompleteRebuildLesson(lesson, record), true);
    assert.equal(canCompleteRebuildLesson(lesson, { ...record, notes: " " }), false);
    assert.equal(canCompleteRebuildLesson(lesson, { ...record, checks: [0] }), false);
    assert.equal(canCompleteRebuildLesson(lesson, { ...record, attempts: attempts.slice(1) }), false);
    assert.equal(canCompleteRebuildLesson(lesson, { ...record,
      attempts: [...attempts, { ...attempts[0], score: 0 }] }), false);
  }
});
