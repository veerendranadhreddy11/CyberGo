"use client";

import { useState } from "react";
import type { RebuildLesson } from "../curriculum/rebuild/representative";
import { canCompleteRebuildLesson, courseProgress, primaryCourses, rebuildPath } from "../lib/rebuild";
import { emptyLesson, type CourseRecord, type CourseState } from "../lib/course";
import { KnowledgeCheck } from "./knowledge";
import { EvidenceAttachments } from "./mission";
import { Meter, Ring } from "./shared";

type Update = (id: string, change: (record: CourseRecord) => CourseRecord) => Promise<boolean>;

export function Curriculum({ track, slug, state, update }: {
  track?: string;
  slug?: string;
  state: CourseState;
  update: Update;
}) {
  const active = primaryCourses.find(item => item.id === track);
  if (!active) return <>
    <section className="nex-hero art-home"><div className="nex-hero-copy">
      <h1>CyberNex</h1><p>Learn. Practice. Progress.</p>
    </div></section>
    <div className="nex-modes">{primaryCourses.map(item => {
      const { completed, next } = courseProgress(item, state);
      return <article key={item.id} className={`nex-mode art-${item.id}`}>
        <div><p>{item.team}</p><h2>{item.name}</h2>
          <p>{completed} of {item.modules.length} published lessons complete</p>
          <a className="button primary" href={`#/learning/${item.id}`}>Open {item.name}</a>
          {next && <a className="button subtle" href={rebuildPath(next.lesson)}>Continue Learning</a>}
        </div><Ring value={100 * completed / item.modules.length} />
      </article>;
    })}</div>
  </>;

  const { completed, next } = courseProgress(active, state);
  const total = active.modules.length;
  const index = active.modules.findIndex(module => module.lesson.id.split("/")[1] === slug);
  const selectedModule = active.modules[index];
  const ready = selectedModule && (!selectedModule.requires || state.records[selectedModule.requires]?.completedAt || state.records[selectedModule.id]?.completedAt);
  if (ready) {
    return <ReviewLesson key={selectedModule.id} lesson={selectedModule.lesson}
      record={state.records[selectedModule.id] ?? emptyLesson()} next={active.modules[index + 1]?.lesson} update={update} />;
  }
  return <>
    <section className={`nex-hero art-${active.id}`}><div className="nex-hero-copy">
      <p>{active.team}</p><h1>{active.name}</h1>
    </div></section>
    <section className="panel lesson-content">
      <h2>Course overview</h2>
      <p>{next?.lesson.level ?? active.modules.at(-1)?.lesson.level} · {completed} of {total} published lessons complete · {Math.round(100 * completed / total)}%</p>
      <Meter value={100 * completed / total} label={`${completed} of ${total} lessons completed`} />
      {next ? <><p>Current module · {next.title}</p><p>Current lesson · {next.lesson.title}</p>
        <a className="button primary" href={rebuildPath(next.lesson)}>Continue Learning</a></> : <p>You’ve completed all currently available lessons.</p>}
      {slug && <p role="alert">{selectedModule ? "Complete the prerequisite lesson first." : "This lesson is not published."}</p>}
      <h3>Modules</h3>
      <ol className="plain-list">{active.modules.map((item, i) => {
        const done = Boolean(state.records[item.id]?.completedAt);
        const locked = !done && item.requires && !state.records[item.requires]?.completedAt;
        return <li key={item.id}><div><strong>Module {i + 1} · {item.title}</strong>
          <p>{locked ? item.lesson.title : <a href={rebuildPath(item.lesson)}>{item.lesson.title}</a>}</p>
          {locked && <small>Prerequisite · {active.modules[i - 1].lesson.title}</small>}
          {item.lesson.objectives.map(objective => <p key={objective}>{objective}</p>)}
        </div><span>{done ? "1 of 1 complete" : locked ? "Locked" : "0 of 1 complete"}</span></li>;
      })}</ol>
      <p>Further Foundation lessons and the Intermediate, Advanced, and Professional Practice levels are in development.</p>
    </section>
    {completed > 0 && <section className="panel lesson-content"><h2>Passed lesson checks</h2>
      <ul>{active.modules.filter(item => state.records[item.id]?.completedAt)
        .map(item => <li key={item.id}>{item.lesson.title} · {item.lesson.questions.length} questions passed</li>)}</ul>
      <p>Independent project assessments are required to demonstrate practical mastery.</p>
    </section>}
  </>;
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
      {next && record.completedAt && <a className="button primary" href={rebuildPath(next)}>Next lesson</a>}
      <a className="button subtle" href={`#/learning/${lesson.track}`}>Back to course</a>
    </section>
  </>;
}
