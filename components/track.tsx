"use client";
import { useEffect, useState } from "react";
import { CalendarDays, CheckCheck, Clock3, FlaskConical, ListChecks, Shield, Signal } from "lucide-react";
import { catalog, getMission, phaseIndex, trackInfo } from "../lib/catalog";
import { activity, percent, status } from "../lib/progress";
import { displayDay } from "../lib/dates";
import type { Day, Progress, Track } from "../lib/types";
import { Meter, pad, Ring, Status, trackHref, TrackIcon } from "./shared";
import type { UpdateProgress } from "./settings";
import { MissionDetail } from "./mission";
import { isScheduled, nextMission, trackElapsed } from "../lib/journey";
import type { CourseRecord, CourseState } from "../lib/course";

export function TrackView({ track, selection, focus, data, today, update, course, saveQuiz }: { track: Track; selection?: string; focus?: string; data: Progress; today: Day; update: UpdateProgress; course: CourseState; saveQuiz: (id:string, attempt:CourseRecord["attempts"][number])=>void }) {
  const info = trackInfo[track];
  const current = nextMission(data,track)?.day ?? 121;
  const scheduled = isScheduled(data,today);
  const elapsed = trackElapsed(data,track,today);
  const view = selection === "roadmap" || selection === "skills" || selection === "history" ? selection : "mission";
  const day = selection && /^\d+$/.test(selection) && +selection <= 120 && +selection >= 1 ? +selection : Math.max(1, Math.min(current, 120));
  useEffect(()=>{
    if(selection || location.hash!==trackHref(track)) return;
    window.history.replaceState(window.history.state,"",trackHref(track,day));
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  },[day,selection,track]);
  const mission = getMission(track, day);
  const history = activity(data, track);
  const [filter, setFilter] = useState("All");
  const [phase, setPhase] = useState(phaseIndex(day));
  const segment = catalog[track].slice(phase * 30, phase * 30 + 30);
  const skills = [...new Set(catalog[track].flatMap(item => item.skills))];
  return <div className={`track-page ${track}`}>
    <div className={`panel path-banner art-${track}`}><div><span className="team"><TrackIcon track={track} size={16} /> {info.team}</span><h1>{info.name}</h1><p>{history.completed.length} / 120 missions completed <span>·</span> {Math.round(history.minutes / 6) / 10} h studied</p></div><Ring value={percent(history.completed.length, 120)} /></div>
    <div className="tab-strip path-tabs" aria-label="Learning path views">
      {[["mission", "Mission", FlaskConical], ["roadmap", "Roadmap", CalendarDays], ["skills", "Skills", Signal], ["history", "History", CheckCheck]].map(([key, label, Icon])=>{
        const TabIcon = Icon as typeof FlaskConical;
        return <a key={String(key)} className={view===key?"active":""} href={key==="mission"?trackHref(track):`#/${track}/${key}`} aria-current={view===key?"page":undefined}><TabIcon size={17}/>{String(label)}</a>;
      })}
      {current<=120&&day!==current&&<a className="text-link" href={trackHref(track,current)}>Resume Mission {current}</a>}
      {current===121&&<a className="text-link" href={`#/report/${track}`}>Completion report</a>}
    </div>
    {scheduled&&<p className="notice">Your journey begins {displayDay(data.start!)}. You can preview missions now.</p>}
    {view === "mission" && <><div className="mission-meta"><span><CalendarDays size={16} /> Mission {pad(day)} / 120</span>{elapsed!==null&&<span>{elapsed} calendar days</span>}<span><Clock3 size={16} /> Suggested {mission.minutes} min</span><span><Signal size={16} /> {mission.difficulty}</span></div><MissionDetail key={mission.id} mission={mission} data={data} today={today} current={current} update={update} focus={focus} locked={(scheduled||day>current)&&!data.missions[mission.id]?.completedAt} quiz={course.records[mission.id]} saveQuiz={attempt=>saveQuiz(mission.id,attempt)}/></>}
    {view === "roadmap" && <section className="panel calendar-panel"><div className="chart-head"><h2>120-mission roadmap</h2><ListChecks size={20} /></div><div className="calendar-filter"><label>Phase <select value={phase} onChange={event => setPhase(+event.target.value)}>{info.phases.map((name, index) => <option key={name} value={index}>{index + 1}. {name}</option>)}</select></label><label>Status <select value={filter} onChange={event => setFilter(event.target.value)}>{["All", "Completed", "Pending", "In progress", "Upcoming", "Ready to start"].map(name => <option key={name}>{name}</option>)}</select></label></div><ul className="plain-list">{segment.filter(item => filter === "All" || status(data.missions[item.id], item.day, current) === filter).map(item => <li key={item.id}><a href={trackHref(track, item.day)} ><small>Mission {pad(item.day)}</small> {item.title}</a><Status value={status(data.missions[item.id], item.day, current)} /></li>)}</ul>{!segment.some(item => filter === "All" || status(data.missions[item.id], item.day, current) === filter) && <p className="empty">No missions match this phase and status.</p>}</section>}
    {view === "skills" && <section className="panel calendar-panel"><div className="chart-head"><h2>Skill progression</h2><Shield size={20} /></div><p>Counts show completed practice for each skill.</p><div className="skills-grid">{skills.map(skill => {
      const missions = catalog[track].filter(item => item.skills.includes(skill));
      const done = missions.filter(item => data.missions[item.id]?.completedAt).length;
      return <div key={skill}><strong>{skill}</strong><span>{done}/{missions.length}</span><Meter value={percent(done, missions.length)} label={skill} /></div>;
    })}</div></section>}
    {view === "history" && <section className="panel calendar-panel"><div className="chart-head"><h2>Mission history</h2><CheckCheck size={20} /></div>{history.completed.length ? <ul className="plain-list">{history.completed.map(item => {
      const finished = getMission(track, Number(item.id.split("-")[1]));
      return <li key={item.id}><a href={trackHref(track, finished.day)} >{finished.title}</a><time dateTime={item.day}>{displayDay(item.day)}</time></li>;
    })}</ul> : <p className="empty">Finished missions and their evidence are accessible here.</p>}</section>}
  </div>;
}
