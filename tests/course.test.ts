import { test } from "node:test";
import assert from "node:assert/strict";
import fixtures from "../curriculum/full-fixtures.json";
import { applyBadges, emptyCourse, emptyLesson, lessons, milestones, modules, nextLesson } from "../lib/course";
import { freshProgress } from "../lib/progress";

test("the self-paced course has ten substantive modules and four Crash Course assessments", () => {
  assert.equal(modules.length,10);
  assert.equal(lessons.length,41);
  assert.equal(milestones.lessons.length,4);
  const all = [...lessons,...milestones.lessons];
  assert.equal(new Set(all.map(lesson=>lesson.id)).size,all.length);
  for (const lesson of all) {
    for (const section of [lesson.explanation,lesson.example,lesson.exercise,lesson.expected,lesson.troubleshooting]) assert.ok(section.length>30,lesson.id);
    assert.equal(lesson.question.choices.length,3);
    assert.equal(new Set(lesson.question.choices).size,3);
    assert.ok(lesson.question.choices[lesson.question.correct]);
  }
  for (const id of Object.keys(fixtures)) assert.ok(all.some(lesson=>lesson.id===id));
});

test("Continue Learning skips completed and independently explored lessons", () => {
  const state=emptyCourse();
  const at="2026-11-19T10:30:00Z";
  state.records[lessons[0].id]={...emptyLesson(),checks:[0,1],completedAt:at};
  state.records[lessons[8].id]={...emptyLesson(),checks:[0,1],completedAt:at};
  assert.equal(nextLesson(state)?.id,lessons[1].id);
  const initial=applyBadges(state,freshProgress(),at);
  assert.deepEqual(initial.badges,{});
  for(const lesson of modules[0].lessons) state.records[lesson.id]={...emptyLesson(),checks:[0,1],completedAt:at};
  const earned=applyBadges(state,freshProgress(),at);
  assert.equal(earned.badges.module,at);
  assert.equal(nextLesson(earned)?.id,modules[1].lessons[0].id);
  assert.equal(nextLesson({...earned,preferredModule:"advanced"})?.id,"advanced/cloud");
});
