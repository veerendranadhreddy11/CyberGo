import assert from "node:assert/strict";
import test from "node:test";
import { getMission } from "../lib/catalog";
import { addDays, isDay, journeyDay, parisDay } from "../lib/dates";
import { activity, checklistPercent, finishMission, freshMission, freshProgress, loadProgress, parseBackup, status, storeProgress, streaks } from "../lib/progress";
import { validateCurriculum } from "../scripts/validate";

const blue = getMission("soc", 1);
const red = getMission("pentest", 1);
const at = new Date("2026-05-04T22:20:00Z");

test("journey mapping spans pre-start, missed days and the archive", () => {
  assert.equal(journeyDay("2026-03-28", "2026-03-27"), 0);
  assert.equal(journeyDay("2026-03-28", "2026-03-28"), 1);
  assert.equal(journeyDay("2026-03-28", "2026-03-30"), 3);
  assert.equal(journeyDay("2026-03-28", addDays("2026-03-28", 119)), 120);
  assert.equal(journeyDay("2026-03-28", addDays("2026-03-28", 120)), 121);
  assert.equal(isDay("2026-02-29"), false);
  assert.equal(isDay("2028-02-29"), true);
});
test("Europe/Paris changes date at the correct winter and summer UTC boundary", () => {
  assert.equal(parisDay(new Date("2026-01-05T22:59:59Z")), "2026-01-05");
  assert.equal(parisDay(new Date("2026-01-05T23:00:00Z")), "2026-01-06");
  assert.equal(parisDay(new Date("2026-07-05T21:59:59Z")), "2026-07-05");
  assert.equal(parisDay(new Date("2026-07-05T22:00:00Z")), "2026-07-06");
});
test("checklists are independent and full checklists require explicit completion", () => {
  const progress = freshProgress();
  progress.missions[blue.id] = { ...freshMission(), checks: [0, 1] };
  assert.equal(checklistPercent(progress.missions[blue.id], blue), 40);
  assert.equal(checklistPercent(progress.missions[red.id], red), 0);
  assert.equal(finishMission(progress, blue, at), progress);
  progress.missions[blue.id]!.checks = blue.checklist.map((_, index) => index);
  assert.equal(activity(progress).completed.length, 0);
  const finished = finishMission(progress, blue, at);
  assert.equal(activity(finished, "soc").completed[0].day, "2026-05-05");
  assert.equal(activity(finished, "pentest").completed.length, 0);
  assert.equal(finishMission(finished, blue, new Date()), finished);
});
test("missed or future dates preserve all data and allow missed-day completion", () => {
  const progress = { ...freshProgress(), start: "2026-04-01" };
  const day = journeyDay(progress.start, "2026-05-05");
  assert.equal(status(undefined, 1, day), "Pending");
  assert.equal(status(undefined, 60, day), "Upcoming");
  const entry = { ...freshMission(), checks: blue.checklist.map((_, index) => index), minutes: 20, studiedOn: "2026-05-03" };
  progress.missions[blue.id] = entry;
  const finished = finishMission(progress, blue, at);
  assert.equal(status(finished.missions[blue.id], 1, day), "Completed");
  assert.equal(activity(finished).minutesByDay["2026-05-03"], 20);
  assert.equal(finished.start, "2026-04-01");
});
test("streaks deduplicate dates, keep yesterday's open streak, and exclude future dates", () => {
  const days = ["2026-05-01", "2026-05-02", "2026-05-03", "2026-05-03", "2026-05-07"];
  assert.deepEqual(streaks(days, "2026-05-04"), { current: 3, longest: 3 });
  assert.deepEqual(streaks(days, "2026-05-07"), { current: 1, longest: 3 });
  assert.deepEqual(streaks(days, "2026-05-06"), { current: 0, longest: 3 });
});
test("storage and backup round-trip and invalid backup cannot replace saved progress", () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  const progress = freshProgress();
  progress.start = "2026-05-04";
  progress.missions[blue.id] = { checks: [0], notes: "Keep this note.", minutes: 15, studiedOn: "2026-05-04" };
  storeProgress(storage, progress);
  assert.deepEqual(parseBackup(JSON.stringify(progress)), loadProgress(storage));
  for (const malformed of [
    "{", '{"version":1,"start":"2026-02-30","missions":{}}',
    '{"version":1,"start":null,"missions":{"pentest-2":{"checks":[0,0],"notes":"","minutes":0}}}',
    '{"version":1,"start":null,"missions":{"soc-1":{"checks":[0],"notes":"","minutes":0,"completedAt":"2026-05-05T01:00:00Z"}}}',
  ]) assert.throws(() => storeProgress(storage, parseBackup(malformed)));
  assert.equal(loadProgress(storage).missions[blue.id]?.notes, "Keep this note.");
});
test("all 240 missions are complete and locally available", validateCurriculum);
