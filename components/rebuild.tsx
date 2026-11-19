"use client";

import { useState } from "react";
import type { RebuildLesson } from "../curriculum/rebuild/representative";
import { reviewLessons } from "../lib/rebuild";
import { canCompleteRebuildLesson, rebuildPath, rebuildTracks } from "../lib/rebuild";
import { emptyLesson, type CourseRecord, type CourseState } from "../lib/course";
import { KnowledgeCheck } from "./knowledge";
import { EvidenceAttachments } from "./mission";
import { Meter } from "./shared";

type Update = (id: string, change: (record: CourseRecord) => CourseRecord) => Promise<boolean>;

export function CurriculumReview({ track, slug, state, update }: {
  track?: string;
  slug?: string;
  state: CourseState;
  update: Update;
}) {
  const active = rebuildTracks.find(item => item.id === track);
  const lessons = reviewLessons.filter(lesson => lesson.track === track);
  const lesson = lessons.find(item => item.id.split("/")[1] === slug);
  if (lesson) {
    return <ReviewLesson key={lesson.id} lesson={lesson}
      record={state.records[lesson.id] ?? emptyLesson()}
      next={lessons[lessons.indexOf(lesson) + 1]} update={update} />;
  }

  if (active) {
    const count = lessons.filter(item => state.records[item.id]?.completedAt).length;
    const next = lessons.find(item => !state.records[item.id]?.completedAt);
    return <>
      <section className={`nex-hero art-${active.id}`}><div className="nex-hero-copy">
        <p>Curriculum review</p><h1>{active.name}</h1><p>{active.team}</p>
      </div></section>
      <section className="panel lesson-content">
        <h2>Review lessons</h2>
        <p>{count} completed · {lessons.length - count} remaining in this batch.</p>
        <Meter value={100 * count / lessons.length} label={`${count} of ${lessons.length} review lessons completed`} />
        {next && <a className="button primary" href={rebuildPath(next)}>Continue Learning</a>}
        <p>The intermediate and advanced review lessons include prerequisite briefings. The intervening modules are being developed.</p>
        {slug && <p role="alert">This lesson is not part of the current batch.</p>}
        <ol className="plain-list">{lessons.map(item =>
          <li key={item.id}><div><small>{item.level} · {item.module}</small><br />
            <a href={rebuildPath(item)}>{item.title}</a></div>
            <span>{state.records[item.id]?.completedAt ? "Complete" : "Available"}</span>
          </li>)}</ol>
        <a className="button subtle" href="#/learning">Both review tracks</a>
      </section>
    </>;
  }

  return <section className="panel lesson-content">
    <h1>Curriculum review</h1>
    <p>Eight offline lessons are available for review. Progress in this batch is recorded separately from the earlier curriculum.</p>
    {track && <p role="alert">Choose a review track below.</p>}
    <div className="nex-modes">{rebuildTracks.map(item => <article key={item.id} className={`nex-mode art-${item.id}`}>
      <div><p>{item.team}</p><h2>{item.name}</h2><a className="button primary" href={`#/learning/${item.id}`}>Review {item.name}</a></div>
    </article>)}</div>
  </section>;
}

function ReviewLesson({ lesson, record, next, update }: {
  lesson: RebuildLesson;
  record: CourseRecord;
  next?: RebuildLesson;
  update: Update;
}) {
  const [celebrate, setCelebrate] = useState(false);
  const save: Parameters<typeof KnowledgeCheck>[0]["save"] = attempt => {
    void update(lesson.id, prior => ({ ...prior, attempts: [...prior.attempts.slice(-99), attempt] }));
  };
  return <>
    <section className={`nex-hero art-${lesson.track}`}><div className="nex-hero-copy">
      <p>{lesson.level} · {lesson.module}</p><h1>{lesson.title}</h1>
    </div></section>
    <section className="panel lesson-content">
      <h2>Learn</h2>
      <ul>{lesson.objectives.map(item => <li key={item}>{item}</li>)}</ul>
      <h3>Before starting</h3><p>{lesson.preparation}</p>
      {lesson.theory.map(item => <p key={item}>{item}</p>)}
      <dl>{lesson.terms.map(([term, definition]) => <div key={term}><dt><strong>{term}</strong></dt><dd>{definition}</dd></div>)}</dl>
    </section>
    <section className="panel lesson-content">
      <h2>Understand</h2>
      <ol className="review-flow" aria-label="Process diagram">{lesson.flow.map((item, index) =>
        <li key={item}><span>{index + 1} · {item}</span></li>)}</ol>
      <h3>Offline practice record</h3><pre className="fixture"><code>{lesson.fixture}</code></pre>
    </section>
    <section className="panel lesson-content">
      <h2>Practise</h2><p>Use the bundled record and lesson notes. An external editor is optional.</p>
      <ol>{lesson.steps.map(step => <li key={step}>{step}</li>)}</ol>
      <h2>Verify</h2><p>{lesson.expected}</p>
      <h3>Troubleshooting</h3><p>{lesson.troubleshoot}</p>
    </section>
    <KnowledgeCheck questions={lesson.questions} record={record} save={save}/>
    <section className="panel lesson-content">
      <h2>Independent challenge</h2><p>{lesson.independent}</p>
      <h3>What to save</h3><p>{lesson.evidence}</p>
      <label>Lesson notes<textarea className="review-notes" maxLength={20000} value={record.notes}
        onChange={event => { const notes = event.currentTarget.value; void update(lesson.id, prior => ({ ...prior, notes })); }} /></label>
      <EvidenceAttachments id={lesson.id} />
    </section>
    <section className="panel lesson-content">
      <h2>Complete lesson</h2><p>{lesson.summary}</p>
      <fieldset disabled={Boolean(record.completedAt)}>
        <legend>Completion checklist</legend>
        {lesson.checklist.map((item, index) => <label className="lesson-check" key={item}>
          <input type="checkbox" checked={record.checks.includes(index)} onChange={event => {
            const checked = event.currentTarget.checked;
            void update(lesson.id, prior => ({ ...prior, checks: checked ? [...prior.checks, index] : prior.checks.filter(value => value !== index) }));
          }} />{item}</label>)}
      </fieldset>
      {!record.completedAt && <>
        <p>Save your notes, check both activities, and answer every question correctly to complete this lesson.</p>
        <button className="button primary" disabled={!canCompleteRebuildLesson(lesson, record)} onClick={async () => {
          if (await update(lesson.id, prior => canCompleteRebuildLesson(lesson, prior)
            ? { ...prior, completedAt: prior.completedAt ?? new Date().toISOString() } : prior)) setCelebrate(true);
        }}>Complete lesson</button>
      </>}
      {record.completedAt && <p>Lesson complete.</p>}
      {celebrate && <p role="status">{lesson.encouragement}</p>}
      {next && record.completedAt && <a className="button primary" href={rebuildPath(next)}>Next review lesson</a>}
      <a className="button subtle" href={`#/learning/${lesson.track}`}>Back to review track</a>
    </section>
  </>;
}
