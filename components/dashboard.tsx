"use client";
import { Activity, CalendarDays, CheckCircle2, Clock3, Flame, Layers3, ListChecks, Target, Trophy } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { activity, checklistPercent, percent, status, streaks } from "../lib/progress";
import { addDays, displayDay, distance, journeyDay } from "../lib/dates";
import { getMission, trackInfo } from "../lib/catalog";
import { nextMission, calendarDays } from "../lib/journey";
import { tracks, type Day, type Progress, type Track } from "../lib/types";
import { Meter, Ring, Status, trackHref, TrackIcon } from "./shared";

export function Dashboard({ data, today }: { data: Progress; today: Day }) {
  const current = journeyDay(data.start, today);

  const record = activity(data);
  const study = new Set([...record.completed.map(item => item.day), ...Object.keys(record.minutesByDay)]);
  const streak = streaks([...study], today);
  const done = record.completed.length;
  return <>
    <section className="hero crash-hero">
      <div className="hero-content">
        <span className="hero-kicker"><span /> CYBERSECURITY TRAINING</span>
        <h1>Mission Control</h1>
        <p>120-Day Crash Course{data.start && ` · Started ${displayDay(data.start, { dateStyle:"long" })}`}</p>
        {data.start && current < 1 && <p>Your journey starts on {displayDay(data.start, { dateStyle: "long" })} · {distance(today, data.start)} {distance(today, data.start) === 1 ? "day" : "days"} to go.</p>}
        <div className="hero-actions"><a className="button primary" href="#/calendar"><CalendarDays size={16} /> View mission calendar</a>{!data.start && <a className="button subtle" href="#/settings">Set start date</a>}</div>
      </div>
      <div className="hero-orbit" aria-hidden="true"><span /><span /><span /><i /><i /><i /></div>
    </section>
    <section className="stat-grid" aria-label="Journey statistics">
      <Stat icon={<CalendarDays size={19} />} label="Elapsed calendar days" number={data.start && current>=1 ? String(calendarDays(data.start,today)) : "Upcoming"} detail="Start day included" />
      <Stat icon={<Flame size={20} />} label="Learning streak" number={`${streak.current} ${streak.current === 1 ? "day" : "days"}`} detail={`Longest streak · ${streak.longest}`} color="orange" />
      <Stat icon={<CheckCircle2 size={19} />} label="Missions completed" number={String(done)} detail="of 240 missions" color="green" />
      <Stat icon={<Target size={20} />} label="Overall progress" number={`${percent(done, 240)}%`} detail="Across both learning paths" />
    </section>
    <div className="section-heading"><div><h2>Learning paths</h2><p>Two independent sequences of 120 missions.</p></div><span className="section-meta"><Layers3 size={16} /> 120 missions per path</span></div>
    <section className="track-grid" aria-label="Learning paths">
      {tracks.map(track => <TrackCard track={track} key={track} data={data} today={today} current={current} day={nextMission(data,track)?.day ?? 120} />)}
    </section>
    <Analytics data={data} today={today} compact />
  </>;
}

function Stat({ icon, label, number, detail, color = "" }: { icon: React.ReactNode; label: string; number: string; detail: string; color?: string }) {
  return <article className="panel stat"><div className={`stat-icon ${color}`}>{icon}</div><div><span>{label}</span><strong>{number}</strong><small>{detail}</small></div></article>;
}

function TrackCard({ track, data, today, current, day }: { track: Track; data: Progress; today: Day; current: number; day: number }) {
  const info = trackInfo[track];
  const mission = getMission(track, day);
  const entry = data.missions[mission.id];
  const completed = activity(data, track);
  const streak = streaks([...completed.completed.map(item => item.day), ...Object.keys(completed.minutesByDay)], today).current;
  const checked = checklistPercent(entry, mission);
  return <article className={`panel track-card ${track}`}>
    <div className="track-top">
      <div><span className="track-emblem"><TrackIcon track={track} size={23} /></span><span className="team">{info.team}</span><h3>{info.name}</h3><p>{completed.completed.length} / 120 missions completed</p></div>
      <a className="track-ring-link" href={trackHref(track)} aria-label={"Open " + info.name + " progress"}><Ring value={percent(completed.completed.length, 120)} /></a>
    </div>
    <div className="track-mission">
      <div className="track-mission-label"><span>{current < 1 ? "UPCOMING JOURNEY" : "COURSE POSITION"}</span><Status value={status(entry, day, current)} /></div>
      <p title={mission.title}>{mission.title}</p>
      <div className="track-meter"><Meter value={checked} label="Mission checklist" /><span>{checked}%</span></div>
    </div>
    <div className="track-footer"><a className="button track-button" href={trackHref(track)}><TrackIcon track={track} size={17} /> Enter {info.short}</a><span><Flame size={16} /> {streak}-day streak</span></div>
  </article>;
}

export function Analytics({ data, today, compact = false }: { data: Progress; today: Day; compact?: boolean }) {
  const record = activity(data);
  const byDay = new Map<Day, { soc: number; pentest: number }>();
  for (const item of record.completed) {
    const count = byDay.get(item.day) ?? { soc: 0, pentest: 0 };
    count[item.track]++;
    byDay.set(item.day, count);
  }
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = addDays(today, index - 6);
    return { name: displayDay(day, { weekday: "short" }), ...(byDay.get(day) ?? { soc: 0, pentest: 0 }) };
  });
  const months = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(Date.UTC(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 6 + index, 1)).toISOString().slice(0, 7);
    const minutes = Object.entries(record.minutesByDay).filter(([date]) => date.startsWith(month)).reduce((sum, [, count]) => sum + count, 0);
    return { name: displayDay(`${month}-01`, { month: "short", year: "2-digit" }), missions: record.completed.filter(item => item.day.startsWith(month)).length, hours: Math.round(minutes / 6) / 10 };
  });
  const dual = streaks([...byDay.entries()].filter(([, count]) => count.soc && count.pentest).map(([date]) => date), today);
  const upcoming = tracks.flatMap(track => { const next = nextMission(data,track); return next ? [next] : []; });
  const heat = Array.from({ length: 91 }, (_, index) => {
    const day = addDays(today, index - 90);
    const count = byDay.get(day);
    return { day, count: count ? count.soc + count.pentest : 0 };
  });
  return <section className="analytics">
    {compact && <div className="section-heading"><div><h2>Learning activity</h2><p>Follow your consistency across both tracks.</p></div><a className="text-link" href="#/activity">View analytics</a></div>}
    <div className="analytics-grid">
      <article className="panel chart"><div className="chart-head"><div><h3>Weekly activity</h3><p>Missions completed over the last 7 days</p></div><Activity size={21} /></div>
        <div className="chart-body" aria-label="Weekly completed missions bar chart">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 400, height: 170 }}><BarChart data={days} margin={{ left: -22, right: 8, top: 10 }}><CartesianGrid vertical={false} stroke="#252d42" strokeDasharray="4 4" /><XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#a3aec6" fontSize={12} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} stroke="#a3aec6" fontSize={12} domain={[0, Math.max(2, ...days.map(day => day.soc + day.pentest))]} /><Tooltip contentStyle={{ background: "#171e32", border: "1px solid #303653", borderRadius: 8 }} cursor={{ fill: "#29314b" }} /><Bar name="SOC" dataKey="soc" stackId="missions" fill="#59aaff" radius={[3, 3, 0, 0]} /><Bar name="Pentesting" dataKey="pentest" stackId="missions" fill="#f36d90" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer>
        </div>
        <div className="chart-legend"><span><i className="blue-dot" /> SOC</span><span><i className="red-dot" /> Pentesting</span>{!days.some(day => day.soc || day.pentest) && <span>No completions this week</span>}</div>
      </article>
      <article className="panel chart"><div className="chart-head"><div><h3>Activity heatmap</h3><p>Daily mission completions · last 13 weeks</p></div><CalendarDays size={20} /></div>
        <div className="heatmap" aria-label="Daily completions for the last 91 days">{heat.map(({ day, count }) => <span key={day} className={`heat heat-${Math.min(4, count)}`} role="img" aria-label={`${day}: ${count} missions`} title={`${displayDay(day)} · ${count} completed`} />)}</div>
        <div className="chart-legend"><span>{heat[0].day.slice(0, 7)} to {today.slice(0, 7)}</span><span className="heat-scale">Less {[0, 1, 2, 3, 4].map(n => <i key={n} className={`heat heat-${n}`} />)} More</span></div>
      </article>
      <article className="panel chart"><div className="chart-head"><div><h3>Monthly performance</h3><p>Completions and recorded study hours</p></div><Clock3 size={20} /></div>
        <div className="chart-body" aria-label="Monthly completions and study hours bar chart"><ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 400, height: 170 }}><BarChart data={months} margin={{ left: -22, right: 8, top: 10 }}><CartesianGrid vertical={false} stroke="#252d42" strokeDasharray="4 4" /><XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#a3aec6" fontSize={12} /><YAxis axisLine={false} tickLine={false} stroke="#a3aec6" fontSize={12} domain={[0, "auto"]} /><Tooltip contentStyle={{ background: "#171e32", border: "1px solid #303653", borderRadius: 8 }} cursor={{ fill: "#29314b" }} /><Bar name="Missions" dataKey="missions" fill="#a393ff" radius={[4, 4, 0, 0]} /><Bar name="Study hours" dataKey="hours" fill="#53c6b8" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        <div className="chart-legend"><span><i className="purple-dot" /> Missions</span><span><i className="green-dot" /> Study hours</span>{!months.some(month => month.missions || month.hours) && <span>No monthly activity yet</span>}</div>
      </article>
      <article className="panel chart summary"><div className="chart-head"><div><h3>Journey snapshot</h3><p>Progress across both learning paths</p></div><Trophy size={20} /></div>
        <div className="snapshot"><Ring mini value={percent(record.completed.length, 240)} /><dl><div><dt>Practical labs completed</dt><dd>{record.completed.length}</dd></div><div><dt>Study hours recorded</dt><dd>{(record.minutes / 60).toFixed(1)} h</dd></div><div><dt>Both-track completion streak</dt><dd>{dual.current} d</dd></div><div><dt>Completed today</dt><dd>{record.completed.filter(item=>item.day===today).length}</dd></div></dl></div>
      </article>
    </div>
    <div className="analytics-grid history-grid">
      <article className="panel chart"><div className="chart-head"><h3>Recently completed</h3><CheckCircle2 size={20} /></div>
        {record.completed.length ? <ul className="plain-list">{record.completed.slice(0, 5).map(item => {
          const mission = getMission(item.track, Number(item.id.split("-")[1]));
          return <li key={item.id}><a href={trackHref(item.track, mission.day)}>{mission.title}</a><time dateTime={item.day}>{displayDay(item.day)}</time></li>;
        })}</ul> : <p className="empty">Completed missions appear here.</p>}
      </article>
      <article className="panel chart"><div className="chart-head"><h3>Upcoming missions</h3><ListChecks size={20} /></div>
        {upcoming.length ? <ul className="plain-list">{upcoming.map(mission => <li key={mission.id}><a href={trackHref(mission.track,mission.day)}>{mission.title}</a><span>Mission {mission.day}</span></li>)}</ul>
          : <p className="empty">Both learning tracks are complete.</p>}
      </article>
    </div>
  </section>;
}
