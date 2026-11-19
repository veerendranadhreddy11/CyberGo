"use client";
import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { displayDay, parisDay } from "../lib/dates";
import { catalog, trackInfo } from "../lib/catalog";
import { nextMission } from "../lib/journey";
import { status } from "../lib/progress";
import { tracks, type Day, type Progress, type Track } from "../lib/types";
import { pad, Status, trackHref, TrackIcon } from "./shared";

export function CalendarView({ data, today }: { data: Progress; today: Day }) {

  const [track, setTrack] = useState<Track>("soc");
  const position = nextMission(data,track)?.day ?? 121;
  const [phase, setPhase] = useState(Math.floor(((nextMission(data,"soc")?.day ?? 120) - 1) / 30));
  return <>
    <div className="page-heading"><h1>Mission calendar</h1><p>{data.start ? `Journey start ${displayDay(data.start)} · ${data.start>today?"Upcoming start":"Actual completion dates"}` : "Review your course position and completion dates."}</p></div>
    <section className={`panel calendar-panel ${track}`}>
      <div className="calendar-heading"><div className="tab-strip" aria-label="Learning path">{tracks.map(path => <button key={path} aria-pressed={path === track} onClick={() => setTrack(path)}><TrackIcon track={path} size={16} />{trackInfo[path].name}</button>)}</div>{!data.start && <a className="button subtle" href="#/settings"><CalendarDays size={16} /> Set start date</a>}</div>
      <div className="calendar-filter"><label>Phase <select value={phase} onChange={event => setPhase(Number(event.target.value))}>{trackInfo[track].phases.map((name, index) => <option value={index} key={name}>{index + 1}. {name}</option>)}</select></label><div className="calendar-legend">{["Completed", "In progress", "Pending", "Upcoming"].map(value => <Status value={value} key={value} />)}</div></div>
      <div className="calendar-grid">{catalog[track].slice(phase * 30, phase * 30 + 30).map(mission => {
        const finished = data.missions[mission.id]?.completedAt;
        const date = finished ? parisDay(new Date(finished)) : null;
        const value = status(data.missions[mission.id], mission.day, position);
        return <a className={`calendar-day status-${value.toLowerCase().replaceAll(" ", "-")}`} key={mission.id} href={trackHref(track, mission.day)} aria-current={position === mission.day ? "step" : undefined}>
          <span><strong>Mission {pad(mission.day)}</strong>{date && <time dateTime={date}>{displayDay(date)}</time>}</span><b>{mission.title}</b><Status value={value} />
        </a>;
      })}</div>
    </section>
  </>;
}
