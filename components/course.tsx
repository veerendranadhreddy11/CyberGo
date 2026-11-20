"use client";

import { courseLessons, reviewLessons } from "../lib/rebuild";
import { rebuildPath } from "../lib/rebuild";
import fixtures from "../curriculum/full-fixtures.json";
import { getMission, trackInfo } from "../lib/catalog";
import { nextMission } from "../lib/journey";
import { fullQuestions } from "../lib/teaching";
import { KnowledgeCheck } from "./knowledge";
import { ReportButton } from "./report";
import { Activity, BookOpen, CheckCircle2, ChevronRight, Crosshair, FlaskConical, LockKeyhole, ShieldCheck, Trophy } from "lucide-react";
import { Bar, BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { applyBadges, badgeDescriptions, badgeNames, trackBadges, completeModule, completed, emptyLesson, lessonLink, lessons, milestones, modules, nextLesson, type CourseRecord, type CourseState, type Lesson } from "../lib/course";
import type { Progress } from "../lib/types";
import { activity, percent, streaks } from "../lib/progress";
import { addDays, displayDay, parisDay } from "../lib/dates";
import { EvidenceAttachments } from "./mission";
import { Meter, Ring } from "./shared";

type Update = (id: string, change: (record: CourseRecord) => CourseRecord) => void;
const full = "#/course";
const chapter = (id: string) => "#/module/" + id;
const recordFor = (state: CourseState, id: string) => state.records[id] ?? emptyLesson();
const timestampLabel = (at: string) => displayDay(parisDay(new Date(at)), { dateStyle: "long" });

export function Home({ crash, state, today }: { crash: Progress; state: CourseState; today: string }) {
  const fullDone = lessons.filter(lesson => completed(state, lesson)).length;
  const next = nextLesson(state);
  const chapter = modules.find(module=>module.lessons.some(lesson=>lesson.id===next?.id));
  const history = activity(crash);
  const days = [...Object.keys(history.minutesByDay),...history.completed.map(item=>item.day),...Object.values(state.records).flatMap(record=>[
    ...record.attempts.map(item=>parisDay(new Date(item.at))),...(record.completedAt?[parisDay(new Date(record.completedAt))]:[])
  ])];
  return <>
    <section className="nex-hero art-home">
      <div className="nex-hero-copy"><h1>CyberNex</h1><p>Learn. Practice. Progress.</p></div>
    </section>
    <div className="nex-modes">
      {(["soc","pentest"] as const).map(track=>{
        const stats=activity(crash,track);
        const next=nextMission(crash,track);
        return <article className={`nex-mode art-${track}`} key={track}>
          <div>{track==="soc"?<ShieldCheck size={26}/>:<Crosshair size={26}/>}<p>{trackInfo[track].team}</p><h2>{trackInfo[track].name}</h2>
          <p>{stats.completed.length} / 120 missions complete</p><p>{next?`Mission ${next.day} · ${next.title}`:"Track complete"}</p>
          <a className="button primary" href={`#/${track}`}>{track==="soc"?"Open SOC":"Open Pentest"}</a></div><Ring value={percent(stats.completed.length,120)}/>
        </article>;
      })}
    </div>
    <section className="nex-mode art-full full-home"><div><BookOpen size={25}/><h2>Full Cybersecurity Course</h2><p>Self-paced learning · {fullDone} / {lessons.length} lessons complete</p>
      <p>{chapter?`Current module · ${chapter.title}`:"All modules complete"}</p>
      {next&&<p>Next lesson · {next.title}</p>}
      <div className="actions"><a className="button primary" href={next?lessonLink(next.id):"#/modules"}>{next?"Continue Learning":"Review lessons"}</a><a className="button subtle" href={full}>Explore Full Course</a></div>
    </div><Ring value={percent(fullDone,lessons.length)}/></section>
    <div className="nex-stat-grid"><article className="panel"><strong>{history.completed.length}</strong><span>Completed missions</span></article>
      <article className="panel"><strong>{streaks(days,today).current}</strong><span>Learning streak · days</span></article>
      <article className="panel"><strong>{percent(history.completed.length+fullDone,240+lessons.length)}%</strong><span>Overall learning progress</span></article>
      <article className="panel"><strong>{fullDone}</strong><span>Completed lessons</span></article></div>
    <section className="panel lesson-content"><h2>Recent activities</h2>
      <ul className="plain-list">{[...history.completed.map(item=>({date:item.at,title:getMission(item.track,Number(item.id.split("-")[1])).title})),
        ...lessons.flatMap(lesson=>state.records[lesson.id]?.completedAt?[{date:state.records[lesson.id].completedAt!,title:lesson.title}]:[])]
        .sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5).map(item=><li key={item.title}>{item.title}<span>{timestampLabel(item.date)}</span></li>)}</ul>
      {!history.completed.length&&!fullDone&&<p>Completed missions and lessons will appear here.</p>}
    </section>
  </>;
}

export function CourseNav({ current }: { current: string }) {
  return <nav className="nex-tabs" aria-label="Full Course navigation">
    {[["course","Overview"],["modules","All Modules"],["labs","Practical Labs"],["quizzes","Quizzes"],["history","Learning History"]].map(([id,label]) =>
      <a key={id} href={`#/${id}`} aria-current={current === id ? "page" : undefined}>{label}</a>)}
  </nav>;
}

export function CrashNav() {
  return <nav className="nex-tabs" aria-label="Crash Course navigation">
    {[["crash","Overview"],["soc","SOC Analyst"],["pentest","Penetration Testing"],["calendar","Mission Calendar"],["activity","Learning History"],["assessments","Assessments"]].map(([id,label]) =>
      <a key={id} href={`#/${id}`}>{label}</a>)}
  </nav>;
}

export function FullCourse({ state, page, selection, chooseModule }: { state: CourseState; page: string; selection?: string; chooseModule: (id?: string) => void }) {
  const next = nextLesson(state);
  const done = lessons.filter(lesson => completed(state, lesson));
  const completedModules = modules.filter(module => completeModule(state, module));
  const current = modules.find(module => module.lessons.some(lesson => lesson.id === next?.id));
  const lastActivity = Object.values(state.records).flatMap(record => [...record.attempts.map(attempt => attempt.at), ...(record.completedAt ? [record.completedAt] : [])]).sort().at(-1);
  const selected = modules.find(module => module.id === selection);
  if (page === "module" && selected) return <>
    <CourseNav current={page} />
    <section className={`nex-hero compact module-art module-${selected.id}`}><div className="nex-hero-copy"><h1>{selected.title}</h1><p>{selected.summary}</p></div></section>
    <section className="panel nex-next">
      <p>{state.preferredModule === selected.id ? "Continue Learning starts with this module." : "Prioritize this module in Continue Learning."}</p>
      {state.preferredModule === selected.id
        ? <button className="button subtle" onClick={()=>chooseModule()}>Use standard order</button>
        : <button className="button primary" onClick={()=>chooseModule(selected.id)}>Study this module next</button>}
    </section>
    <LessonList items={selected.lessons} state={state} mode="lessons" />
  </>;
  if (page === "labs" || page === "quizzes" || page === "history" || page === "assessments") {
    const history = [...lessons, ...milestones.lessons].filter(lesson => {
      const record = state.records[lesson.id];
      return record?.completedAt || record?.attempts.length;
    }).sort((a,b) => {
      const date = (lesson: Lesson) => {
        const record = state.records[lesson.id];
        return [record?.completedAt ?? "", record?.attempts.at(-1)?.at ?? ""].sort().at(-1) ?? "";
      };
      return date(b).localeCompare(date(a));
    });
    const items = page === "history" ? history : page === "assessments" ? milestones.lessons : lessons;
    return <>
      {page === "assessments" ? <CrashNav /> : <CourseNav current={page} />}
      <h1>{page === "history" ? "Learning History" : page === "labs" ? "Practical Labs" : page === "quizzes" ? "Quizzes" : "Crash Course Assessments"}</h1>
      <LessonList items={items} state={state} mode={page === "quizzes" ? "quiz" : page === "labs" ? "practice" : "lessons"} />
    </>;
  }
  return <>
    <CourseNav current={page} />
    {page !== "modules" ? <>
      <section className="nex-hero art-full">
        <div className="nex-hero-copy"><h1>Full Cybersecurity Course</h1><p>Self-paced learning across {modules.length} modules.</p>
          <a className="button primary" href={next ? lessonLink(next.id) : "#/modules"}>{next ? "Continue learning" : "Review lessons"}<ChevronRight size={18} /></a>
        </div>
        <Ring value={percent(done.length,lessons.length)} />
      </section>
      <div className="nex-stat-grid">
        {[[done.length,"Completed lessons"],[lessons.length-done.length,"Remaining lessons"],[completedModules.length,"Completed modules"],[done.length,"Completed practical labs"]].map(([value,label]) => <article className="panel" key={label}><strong>{value}</strong><span>{label}</span></article>)}
      </div>
      <section className="panel nex-next"><div><h2>{current?.title ?? "Course complete"}</h2><p>{next?.title ?? "All lessons are available for review."}</p></div><p>Last activity {lastActivity ? timestampLabel(lastActivity) : "· None yet"}</p></section>
    </> : <h1>Learning roadmap</h1>}
    <div className="section-heading"><h2>Module progress</h2></div>
    <div className="nex-roadmap">
      {modules.map((module, index) => {
        const count = module.lessons.filter(lesson => completed(state, lesson)).length;
        const status = count === module.lessons.length ? "Complete" : current?.id === module.id ? "Current" : count ? "In progress" : "Upcoming";
        return <a key={module.id} className={`panel module-card module-art module-${module.id}`} href={chapter(module.id)}>
          <span>Module {index+1} · {status}</span><h3>{module.title}</h3><p>{module.summary}</p>
          <Meter value={percent(count,module.lessons.length)} label={module.title} /><span>{count} / {module.lessons.length} lessons</span>
        </a>;
      })}
    </div>
  </>;
}

function LessonList({items,state,mode}:{items:Lesson[];state:CourseState;mode:"lessons"|"quiz"|"practice"}) {
  return <ul className="plain-list nex-list panel">
    {items.length === 0 && <li>No learning activity yet.</li>}
    {items.map(lesson => {
      const record = state.records[lesson.id];
      const score = record?.attempts.at(-1)?.score;
      return <li key={lesson.id}><a href={lessonLink(lesson.id)+(mode === "lessons" ? "" : "/"+mode)}>{lesson.title}</a>
        <span>{mode === "quiz" ? score === undefined ? "Not attempted" : `Latest score ${score}%` : record?.completedAt ? `Completed · ${timestampLabel(record.completedAt)}` : "Open"}</span></li>;
    })}
  </ul>;
}

export function LessonView({ lesson,state,update,focus }: {lesson:Lesson;state:CourseState;update:Update;focus?:string}) {
  const record = recordFor(state,lesson.id);
  const mod = modules.find(m => m.lessons.some(l => l.id === lesson.id));
  const following = lesson.id.startsWith("milestones/") ? milestones.lessons[milestones.lessons.indexOf(lesson)+1] : lessons[lessons.indexOf(lesson)+1];
  return <>
    {mod ? <CourseNav current="lesson" /> : <CrashNav />}
    <section className={`nex-hero compact module-art module-${mod?.id ?? "soc"}`}>
      <div className="nex-hero-copy"><a href={mod ? chapter(mod.id) : "#/assessments"}>{mod?.title ?? "Crash Course Assessments"}</a><h1>{lesson.title}</h1></div>
    </section>
    <div className="lesson-layout">
      <div className="panel lesson-content">
        <h2>Learning objective</h2><p>Explain {lesson.title.replace(/^Day \d+ · /, "").toLowerCase()} and support your explanation with evidence from the practice task.</p>
        <h2>Explanation</h2><p>{lesson.explanation}</p>
        <h2>Technical example</h2><p>{lesson.example}</p><div className="study-flow" role="img" aria-label="Concept, practice, and verification"><span>Concept</span><span>Practice</span><span>Verification</span></div>
        <h2>Practical exercise</h2><p>{lesson.exercise}</p>
        {lesson.id in fixtures && <><h2>Practice data</h2><pre>{fixtures[lesson.id as keyof typeof fixtures]}</pre></>}
        {lesson.command && <><h2>Command reference</h2><pre>{lesson.command}</pre></>}
        <h2>Expected results</h2><p>{lesson.expected}</p>
        <h2>Troubleshooting</h2><p>{lesson.troubleshooting}</p>
        <EvidenceAttachments id={lesson.id} />
        <p>{following && <a className="text-link" href={lessonLink(following.id)}>Next recommended lesson · {following.title}</a>}</p>
      </div>
      <div>
        <KnowledgeCheck questions={fullQuestions[lesson.id]} record={record} save={attempt=>update(lesson.id,previous=>({...previous,attempts:[...previous.attempts.slice(-99),attempt]}))}/>
        <section className={`panel lesson-content ${focus === "practice" ? "quiz-focus" : ""}`}>
          <h2>{record.completedAt ? "Lesson complete" : "Completion checklist"}</h2>
          {[["Explain the concept in my own words",0],["Finish the exercise and verify the result",1]].map(([label,id]) =>
            <label className="lesson-check" key={id}><input type="checkbox" checked={record.checks.includes(Number(id))} disabled={!!record.completedAt} onChange={e=>{
              const checked=e.currentTarget.checked;
              update(lesson.id, prev=>({...prev,checks:checked?[...new Set([...prev.checks,Number(id)])]:prev.checks.filter(check=>check!==id)}));
            }}/>{label}</label>)}
          {!record.completedAt && <button className="button primary" disabled={record.checks.length!==2} onClick={()=>update(lesson.id,prev=>({...prev,completedAt:new Date().toISOString()}))}><CheckCircle2 size={16}/>Mark lesson complete</button>}
          <label className="nex-notes-label">Learning notes<textarea rows={5} value={record.notes} maxLength={20000} onChange={e=>{
            const notes=e.currentTarget.value;
            update(lesson.id,prev=>({...prev,notes}));
          }} /></label>
          {record.completedAt && <p className="completion">Completed {timestampLabel(record.completedAt)}</p>}
        </section>
      </div>
    </div>
  </>;
}

export function LearningStats({state,crash,today}:{state:CourseState;crash:Progress;today:string}) {
  const crashCompleted = activity(crash).completed;
  const lessonDays = Object.values(state.records).flatMap(record=> record.completedAt ? [parisDay(new Date(record.completedAt))] : []);
  const dates = [...crashCompleted.map(record=>record.day),...lessonDays];
  const counts = new Map<string,number>();
  for (const date of dates) counts.set(date,(counts.get(date)??0)+1);
  const week = Array.from({length:7},(_,index)=>{ const date=addDays(today,index-6); return {day:displayDay(date,{weekday:"short"}),completions:counts.get(date)??0}; });
  const radar = [["Networking","networking"],["Linux","linux"],["Windows","windows"],["SOC","soc"],["Pentesting","assessment"],["Python","python"],["Cloud Security","cloud"]].map(([skill,id])=>{
    const related = id === "cloud" ? lessons.filter(l=>l.id === "advanced/cloud") : modules.find(m=>m.id===id)?.lessons ?? [];
    const track = id === "soc" ? "soc" : id === "assessment" ? "pentest" : null;
    const extra = track ? activity(crash,track).completed.length : 0;
    return {skill, value:percent(related.filter(l=>completed(state,l)).length+extra,related.length+(track?120:0))};
  });
  return <><div className="nex-next"><h1>My Progress</h1><ReportButton crash={crash} course={state} today={today}/></div>
    <div className="nex-stat-grid">{[[crashCompleted.length,"Crash Course missions"],[lessons.filter(l=>completed(state,l)).length,"Full Course lessons"],[streaks([...dates,...Object.keys(activity(crash).minutesByDay)],today).current,"Active streak days"]].map(([value,label])=><article className="panel" key={label}><strong>{value}</strong><span>{label}</span></article>)}</div>
    <div className="nex-modes">
      <section className="panel lesson-content"><h2>Weekly learning activity</h2><div className="nex-chart"><ResponsiveContainer><BarChart data={week}><CartesianGrid stroke="#283448"/><XAxis dataKey="day" stroke="#b6c6e2"/><YAxis allowDecimals={false} stroke="#b6c6e2"/><Tooltip contentStyle={{background:"#141e32"}}/><Bar dataKey="completions" fill="#8eaaff" isAnimationActive={false}/></BarChart></ResponsiveContainer></div></section>
      <section className="panel lesson-content"><h2>Skills radar</h2><p>Curriculum-based learning progress</p><div className="nex-chart"><ResponsiveContainer><RadarChart data={radar}><PolarGrid stroke="#405478"/><PolarAngleAxis dataKey="skill" tick={{fill:"#c7d6ef",fontSize:12}}/><Radar dataKey="value" stroke="#b79dff" fill="#a98cff" fillOpacity={.45} isAnimationActive={false}/><Tooltip contentStyle={{background:"#141e32"}}/></RadarChart></ResponsiveContainer></div></section>
    </div>
    <section className="panel lesson-content"><h2>Learning heatmap</h2><div className="nex-heatmap">{Array.from({length:91},(_,i)=>{const date=addDays(today,i-90);const count=counts.get(date)??0;return <span key={date} title={`${date} · ${count} completions`} aria-label={`${date}, ${count} completions`} className={`heat-${Math.min(4,count)}`}/>;})}</div></section>
  </>;
}

export function Achievements({state,crash}:{state:CourseState;crash:Progress}) {
  const badges = applyBadges(state,crash).badges;
  const entries = {...Object.fromEntries(Object.entries(badgeNames).map(([key,name])=>[key,[name,badgeDescriptions[key as keyof typeof badgeNames]]])), ...trackBadges};
  const icons = [Trophy,Activity,ShieldCheck,Crosshair,FlaskConical];
  return <><h1>Achievements</h1><div className="nex-roadmap">{Object.entries(entries).map(([key,[name,description]],index)=>{
    const Icon = badges[key] ? icons[index % icons.length] : LockKeyhole;
    return <article className={`panel module-card ${badges[key]?"badge-unlocked":""}`} key={key}><Icon size={25}/><h2>{name}</h2><p>{description}</p><span>{badges[key] ? `Unlocked ${timestampLabel(badges[key])}` : "Locked"}</span></article>;
  })}</div></>;
}

export function Notes({state,crash}:{state:CourseState;crash:Progress}) {
  const crashNotes=Object.entries(crash.missions).flatMap(([id,record])=>record?.notes.trim() ? [[id,record] as const] : []);
  const fullNotes=Object.entries(state.records).filter(([,record])=>record.notes.trim());
  return <><h1>Notes</h1>{!crashNotes.length&&!fullNotes.length&&<p>Notes saved in a mission or lesson appear here.</p>}
    <div className="nex-roadmap">{crashNotes.map(([id,record])=><article className="panel lesson-content" key={id}><h2><a href={`#/${id.replace("-","/")}`}>{id.toUpperCase()} · Crash Course</a></h2><p className="note-content">{record.notes}</p></article>)}
    {fullNotes.map(([id,record])=> {
      const review = reviewLessons.find(lesson => lesson.id === id);
      return <article className="panel lesson-content" key={id}><h2><a href={review && courseLessons.some(lesson => lesson.id === id) ? rebuildPath(review) : `#/archive/${id}`}>{review?.title ?? [...lessons,...milestones.lessons].find(lesson=>lesson.id===id)?.title ?? id}</a></h2><p className="note-content">{record.notes}</p></article>;
    })}</div></>;
}
