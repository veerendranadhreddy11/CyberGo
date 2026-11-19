"use client";
import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { addDays, displayDay, journeyDay } from "../lib/dates";
import { catalog, trackInfo } from "../lib/catalog";
import { status } from "../lib/progress";
import { tracks, type Day, type Progress, type Track } from "../lib/types";
import { pad, Status, trackHref, TrackIcon } from "./shared";

export function CalendarView({ data, today }: { data: Progress; today: Day }) {
  const actual = journeyDay(data.start, today);
  const [track, setTrack] = useState<Track>("soc");
  const [phase, setPhase] = useState(Math.floor((Math.min(120, Math.max(1, actual)) - 1) / 30));
  return <>
    <div className="page-heading"><h1>Mission calendar</h1><p>{data.start ? `Journey starts ${displayDay(data.start)} · ${actual > 120 ? "Archived schedule" : actual < 1 ? "Scheduled" : `Day ${actual} of 120`}` : "Preview the schedule and set your start date when you're ready."}</p></div>
    <section className={`panel calendar-panel ${track}`}>
      <div className="calendar-heading"><div className="tab-strip" aria-label="Learning path">{tracks.map(path => <button key={path} aria-pressed={path === track} onClick={() => setTrack(path)}><TrackIcon track={path} size={16} />{trackInfo[path].name}</button>)}</div>{!data.start && <a className="button subtle" href="#/settings"><CalendarDays size={16} /> Set start date</a>}</div>
      <div className="calendar-filter"><label>Phase <select value={phase} onChange={event => setPhase(Number(event.target.value))}>{trackInfo[track].phases.map((name, index) => <option value={index} key={name}>{index + 1}. {name}</option>)}</select></label><div className="calendar-legend">{["Completed", "In progress", "Pending", "Upcoming"].map(value => <Status value={value} key={value} />)}</div></div>
      <div className="calendar-grid">{catalog[track].slice(phase * 30, phase * 30 + 30).map(mission => {
        const date = data.start ? addDays(data.start, mission.day - 1) : null;
        const value = status(data.missions[mission.id], mission.day, actual);
        return <a className={`calendar-day status-${value.toLowerCase().replaceAll(" ", "-")}`} key={mission.id} href={trackHref(track, mission.day)} aria-current={actual === mission.day ? "date" : undefined}>
          <span><strong>Day {pad(mission.day)}</strong>{date && <time dateTime={date}>{displayDay(date)}</time>}</span><b>{mission.title}</b><Status value={value} />
        </a>;
      })}</div>
    </section>
  </>;
}
