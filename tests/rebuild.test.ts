import assert from "node:assert/strict";
import { test } from "node:test";
import { reviewLessons } from "../lib/rebuild";
import answers from "../curriculum/rebuild/answers.json";
import legacyAnswers from "../curriculum/course-answers.json";
import { emptyCourse, emptyLesson } from "../lib/course";
import { canCompleteRebuildLesson, rebuildPath, primaryCourses, courseProgress, isLessonAvailable } from "../lib/rebuild";

test("each review track contains a beginner lesson, intermediate lab, and advanced assessment", () => {
  assert.deepEqual(primaryCourses.map(track => track.id), ["soc", "pentest"]);
  assert.equal(new Set(reviewLessons.map(lesson => rebuildPath(lesson))).size, 16);
  assert.equal(new Set(reviewLessons.map(lesson => lesson.encouragement)).size, 16);
  for (const { id } of primaryCourses) {
    assert.deepEqual(reviewLessons.filter(lesson => lesson.track === id).map(lesson => lesson.level),
      [...Array(5).fill("Absolute Beginner"), "Foundation", "Intermediate", "Advanced"]);
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

test("published modules have unique IDs and prerequisites point to the preceding lesson in their own course", () => {
  const allIds = primaryCourses.flatMap(course => course.modules.map(module => module.id));
  assert.equal(new Set(allIds).size, allIds.length);
  for (const course of primaryCourses) {
    assert.deepEqual(course.modules.map(module => module.lesson.level), [...Array(5).fill("Absolute Beginner"), "Foundation"]);
    assert.deepEqual(course.modules.map(module => module.requires),
      course.modules.map((_, index) => course.modules[index - 1]?.id));
    const state = emptyCourse();
    assert.equal(courseProgress(course, state).next?.id, course.modules[0].id);
    state.records[course.modules[0].id] = { ...emptyLesson(), completedAt: "2026-11-20T06:00:00Z" };
    assert.equal(courseProgress(course, state).next?.id, course.modules[1].id);
    const other = primaryCourses.find(item => item.id !== course.id)!;
    assert.equal(courseProgress(other, state).completed, 0);
  }
});

test("both active Module 1 lessons start with substantial computer fundamentals and five questions", () => {
  for (const course of primaryCourses) {
    const [first, second] = course.modules;
    assert.ok(course.modules.every(item => item.lesson.questions.length === 5));
    assert.equal(first.lesson.title, "What Is a Computer?");
    assert.equal(first.title, "Computer and Cybersecurity Foundations");
    assert.equal(first.requires, undefined);
    assert.equal(first.lesson.questions.length, 5);
    assert.equal(second.lesson.title, "How Computers Work");
    assert.equal(second.requires, first.id);
  }
});

test("old completions stay available without unlocking unfinished later lessons", () => {
  for (const track of primaryCourses) {
    const state = emptyCourse();
    state.records[track.modules[4].id] = { ...emptyLesson(), completedAt: "2026-11-20T06:00:00Z" };
    assert.equal(isLessonAvailable(track, 4, state), true);
    assert.equal(isLessonAvailable(track, 5, state), false);
    assert.equal(courseProgress(track, state).next?.id, track.modules[0].id);
  }
});
