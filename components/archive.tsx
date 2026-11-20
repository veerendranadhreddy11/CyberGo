"use client";

import { useEffect, useState } from "react";
import { catalog } from "../lib/catalog";
import { lessons, milestones, type CourseState } from "../lib/course";
import { errorText, desktop, native } from "../lib/desktop";
import { evidenceRecordIds } from "../lib/evidence";
import { courseLessons, reviewLessons } from "../lib/rebuild";
import type { Day, MissionId, Progress } from "../lib/types";
import { EvidenceAttachments } from "./mission";
import { ReportButton } from "./report";

const previousTitles = new Map([
  ...Object.values(catalog).flat().map(mission => [mission.id, mission.title] as const),
  ...[...lessons, ...milestones.lessons, ...reviewLessons.filter(lesson => !courseLessons.some(active => active.id === lesson.id))]
    .map(lesson => [lesson.id, lesson.title] as const)
]);

export function LearningArchive({ state, progress, today, selected }: {
  state: CourseState; progress: Progress; today: Day; selected?: string;
}) {
  const [attachments, setAttachments] = useState<string[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const request = native() ? desktop.evidence().then(files => files.map(file => file.mission)) : evidenceRecordIds();
    void request.then(ids => {
      if (active) setAttachments(ids);
    }, cause => { if (active) setError(errorText(cause)); });
    return () => { active = false; };
  }, []);
  const ids = [...new Set([...Object.keys(progress.missions), ...Object.keys(state.records), ...attachments])]
    .filter(id => previousTitles.has(id));
  const title = selected ? previousTitles.get(selected) : undefined;
  const id = title && selected ? selected : undefined;
  const record = id ? state.records[id] : undefined;
  const mission = id ? progress.missions[id as MissionId] : undefined;
  return <section className="panel lesson-content">
    <h1>Learning archive</h1>
    <p>Earlier work is kept here with its original records. It does not grant credit in the current courses.</p>
    {error && <p role="alert">{error}</p>}
    {id ? <>
      <h2>{title}</h2>
      <p>Record ID · {id}</p>
      {(record?.completedAt || mission?.completedAt) && <p>Completed · {record?.completedAt ?? mission?.completedAt}</p>}
      <p>{(mission?.checks ?? record?.checks ?? []).length} activities checked{mission ? ` · ${mission.minutes} minutes logged` : ""}</p>
      {(mission?.notes || record?.notes) && <><h3>Saved notes</h3><p className="note-content">{mission?.notes || record?.notes}</p></>}
      {Boolean(record?.attempts.length) && <><h3>Quiz history</h3><ul>{record?.attempts.map((attempt, index) =>
        <li key={index}>Question {(attempt.question ?? 0) + 1} · {attempt.score}% · {attempt.at}</li>)}</ul></>}
      <EvidenceAttachments id={id} />
      <a className="button subtle" href="#/archive">All archived records</a>
    </> : <>
      {progress.start && <p>Original start date · {progress.start}</p>}
      {ids.length ? <ul className="plain-list">{ids.map(key =>
        <li key={key}><a href={`#/archive/${key}`}>{previousTitles.get(key)}</a></li>)}</ul> : <p>No earlier records have been saved on this profile.</p>}
      <div className="actions"><a className="button subtle" href="#/legacy-progress">View earlier activity</a>
        <ReportButton crash={progress} course={state} today={today} /></div>
    </>}
  </section>;
}
