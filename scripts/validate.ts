import assert from "node:assert/strict";
import { catalog } from "../lib/catalog";
import { tracks } from "../lib/types";

export function validateCurriculum() {
  const ids = new Set<string>();
  const titles = new Set<string>();
  const samples = new Set<string>();
  for (const track of tracks) {
    assert.equal(catalog[track].length, 120);
    for (const [index, mission] of catalog[track].entries()) {
      assert.equal(mission.day, index + 1);
      assert.equal(mission.id, `${track}-${mission.day}`);
      assert.equal(mission.track, track);
      assert.ok(!ids.has(mission.id) && !titles.has(mission.title) && !samples.has(mission.sample ?? ""));
      assert.ok(mission.title.length > 15 && mission.minutes > 0 && mission.difficulty);
      for (const field of [mission.objective, mission.setup, mission.sample, mission.expected, mission.troubleshoot, mission.evidence]) {
        assert.ok(field && field.trim().length > 15, `${mission.id} missing instructional content`);
      }
      assert.ok(mission.platform.trim() && mission.command.trim());
      for (const values of [mission.steps, mission.checklist, mission.skills, mission.tools]) {
        assert.ok(values.length && values.every(value => value.trim().length > 0));
        assert.equal(values.length, new Set(values).size, mission.id);
      }
      assert.ok(mission.steps.length >= 3 && mission.checklist.length >= 3);
      assert.ok(!mission.previous || (mission.previous >= 1 && mission.previous < mission.day));
      ids.add(mission.id);
      titles.add(mission.title);
      samples.add(mission.sample!);
    }
  }
  assert.equal(ids.size, 240);
}

if (process.argv[1]?.endsWith("validate.ts")) {
  validateCurriculum();
  console.log("Verified 120 SOC missions and 120 Pentesting missions, with unique IDs, titles and artifacts.");
}
