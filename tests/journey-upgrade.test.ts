import { test } from "node:test";
import assert from "node:assert/strict";
import { catalog } from "../lib/catalog";
import { emptyCourse, applyBadges, lessons, milestones } from "../lib/course";
import { calendarDays, isScheduled, missionCount, nextMission, trackElapsed } from "../lib/journey";
import { finishMission, freshMission, freshProgress } from "../lib/progress";
import { buildPdf, reportLines } from "../lib/report";
import { fullQuestions, missionGuides, missionTeaching } from "../lib/teaching";
import { tracks } from "../lib/types";

test("sequences progress independently on the same day and preserve the inclusive elapsed time", () => {
  let progress={...freshProgress(),start:"2026-01-01"};
  const at=new Date("2026-01-02T10:00:00Z");
  assert.equal(isScheduled(progress,"2025-12-31"),true);
  for(const mission of catalog.soc) {
    assert.equal(nextMission(progress,"soc")?.id,mission.id);
    progress={...progress,missions:{...progress.missions,[mission.id]:{...freshMission(),checks:mission.checklist.map((_,index)=>index)}}};
    progress=finishMission(progress,mission,at) as typeof progress;
  }
  assert.equal(missionCount(progress,"soc"),120);
  assert.equal(nextMission(progress,"pentest")?.day,1);
  assert.equal(trackElapsed(progress,"soc","2027-06-01"),2);
  assert.equal(calendarDays("2026-03-28","2026-03-30"),3);
  let badges=applyBadges(emptyCourse(),progress);
  assert.ok(badges.badges["soc-120"]);
  assert.equal(badges.badges.dual,undefined);
  for(const mission of catalog.pentest) {
    progress={...progress,missions:{...progress.missions,[mission.id]:{...freshMission(),checks:mission.checklist.map((_,index)=>index)}}};
    progress=finishMission(progress,mission,at) as typeof progress;
  }
  badges=applyBadges(badges,progress);
  assert.ok(badges.badges.dual);
});

test("all mission and Full Course teaching overlays have substantive content and distinct questions", () => {
  const motivation=new Set<string>();
  const prompts=new Set<string>();
  function quiz(questions: typeof fullQuestions[string]) {
    assert.equal(questions.length,5);
    for(const q of questions) {
      assert.equal(q.choices.length,4);
      assert.equal(new Set(q.choices).size,4);
      assert.ok(q.choices[q.correct]?.length>0);
      assert.ok(q.prompt.length>20 && q.explanation.length>20 && !prompts.has(q.prompt));
      prompts.add(q.prompt);
    }
  }
  for(const track of tracks) for(const mission of catalog[track]) {
    const learning=missionTeaching[mission.id];
    for (const section of [learning.theory,learning.example,learning.relevance,learning.analysis,mission.setup,mission.troubleshoot,mission.expected,mission.evidence]) assert.ok(section.length>15,mission.id);
    assert.ok(learning.pivot && mission.sample?.length);
    assert.ok(mission.steps.length>=3 && mission.checklist.length>=3 && mission.command.length && missionGuides(mission).length);
    quiz(learning.questions);
    motivation.add(learning.motivation);
  }
  assert.equal(motivation.size,240);
  for(const lesson of [...lessons,...milestones.lessons]) quiz(fullQuestions[lesson.id]);
});

test("local PDF has a valid page tree, xref offsets, and progress measurements", () => {
  const result=new TextDecoder().decode(buildPdf([...reportLines(freshProgress(),emptyCourse(),"2026-11-19"),...Array(50).fill("Add (case)\\scope")]));
  assert.ok(result.startsWith("%PDF-1.4\n"));
  assert.match(result,/\(SOC Analyst: 0\/120/);
  assert.match(result,/\/Count 3/);
  const xref=Number(result.match(/startxref\n(\d+)/)?.[1]);
  assert.equal(result.slice(xref,xref+4),"xref");
  for(const [index, match] of [...result.matchAll(/(\d{10}) 00000 n/g)].entries()) {
    assert.ok(result.slice(Number(match[1])).startsWith(`${index+1} 0 obj`));
  }
});
