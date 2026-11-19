"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, House, Activity, BookOpen, CalendarDays, ChevronRight, CircleHelp, LayoutDashboard, Menu, Settings2, ShieldCheck, StickyNote, Trophy, X } from "lucide-react";
import { motion, MotionConfig } from "motion/react";
import { parisDay, displayDay } from "../lib/dates";
import { freshProgress } from "../lib/progress";
import { desktop, errorText, native, readCourse, readProgress, readReducedMotion, writeCourse, writeProgress, writeReducedMotion } from "../lib/desktop";
import { Welcome } from "./welcome";
import Image from "next/image";
import type { Progress, Track } from "../lib/types";
import { trackInfo } from "../lib/catalog";
import { Dashboard, Analytics } from "./dashboard";
import { CalendarView } from "./calendar";
import { TrackView } from "./track";
import { Settings } from "./settings";
import { CompletionReport } from "./report";
import { missionCount } from "../lib/journey";
import { applyBadges, emptyCourse, emptyLesson, lessons, milestones, type CourseRecord, type CourseState } from "../lib/course";
import { Achievements, CrashNav, FullCourse, Home, LearningStats, LessonView, Notes } from "./course";

const navigation = [
  { title: "WORKSPACE", links: [{ id: "", title: "Home", icon: LayoutDashboard },
    { id: "crash", title: "120-Day Crash Course", icon: ShieldCheck }, { id: "course", title: "Full Cybersecurity Course", icon: BookOpen },
    { id: "progress", title: "My Progress", icon: Activity }, { id: "achievements", title: "Achievements", icon: Trophy },
    { id: "notes", title: "Notes", icon: StickyNote }, { id: "settings", title: "Settings", icon: Settings2 }] },
];
const fullPages = ["course", "modules", "module", "labs", "quizzes", "history"];
const crashPages = ["crash", "soc", "pentest", "calendar", "activity", "assessments"];
const route = () => window.location.hash.replace(/^#\/?/, "").split("/");

export function Workspace() {
  const [data, setData] = useState<Progress>(freshProgress);
  const [course, setCourse] = useState<CourseState>(emptyCourse);
  const currentCourse = useRef(course);
  const retrySave = useRef<() => void>(() => undefined);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const currentProgress = useRef<Progress>(data);
  const writes = useRef<Promise<boolean>>(Promise.resolve(true));
  const sequence = useRef(0);
  const restoring = useRef(false);
  const [today, setToday] = useState("");
  const [where, setWhere] = useState<string[]>([""]);
  const historyDepth = useRef(0);
  const [warning, setWarning] = useState("");
  const [mobile, setMobile] = useState(false);
  const menuToggle = useRef<HTMLButtonElement>(null);
  const closeNavigation = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const syncDate = () => setToday(parisDay());
    historyDepth.current = Number(history.state?.nexDepth ?? 0);
    history.replaceState({...history.state,nexDepth:historyDepth.current},"");
    const syncRoute = () => {
      const depth = history.state?.nexDepth;
      historyDepth.current = typeof depth === "number" ? depth : historyDepth.current + 1;
      if(typeof depth !== "number") history.replaceState({...history.state,nexDepth:historyDepth.current},"");
      setWhere(route()); setMobile(false); window.scrollTo(0, 0);
    };
    let active = true;
    void Promise.all([readProgress(), readCourse(), readReducedMotion()]).then(async ([saved, course, reduceMotion]) => {
      const earned = applyBadges(course, saved);
      if (earned !== course) await writeCourse(earned);
      if (active) {
        currentProgress.current = saved; setData(saved);
        currentCourse.current = earned; setCourse(earned);
        setReducedMotion(reduceMotion); setLoaded(true);
      }
    }).catch(error => { if (active) setWarning(errorText(error)); });
    syncDate();
    syncRoute();
    const timer = setInterval(syncDate, 15_000);
    window.addEventListener("focus", syncDate);
    window.addEventListener("hashchange", syncRoute);
    if (!native() && "serviceWorker" in navigator && process.env.NODE_ENV === "production") navigator.serviceWorker.register("/offline.js").catch(() => undefined);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("focus", syncDate);
      window.removeEventListener("hashchange", syncRoute);
    };
  }, []);

  function closeMenu() {
    setMobile(false);
    menuToggle.current?.focus();
  }

  useEffect(() => {
    if (!mobile) return;
    closeNavigation.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [mobile]);

  function replaceProgress(next: Progress) {
    currentProgress.current = next;
    setData(next);
  }

  function replaceCourse(value: CourseState) {
    currentCourse.current = value;
    setCourse(value);
  }

  function enqueue(operation: () => Promise<void>) {
    const revision = ++sequence.current;
    setSaveStatus("Saving…");
    retrySave.current = () => { void enqueue(operation); };
    const save = writes.current.then(async () => {
      try {
        await operation();
        if (sequence.current === revision) {
          setWarning("");
          setSaveStatus("Saved locally");
        }
        return true;
      } catch (error) {
        if (sequence.current === revision) {
          setSaveStatus("Save failed");
          setWarning(errorText(error));
        }
        return false;
      }
    });
    writes.current = save;
    return save;
  }

  function update(change: (previous: Progress) => Progress) {
    if (restoring.current) return Promise.resolve(false);
    const next = change(currentProgress.current);
    const firstStart = !data.start && !!next.start;
    if (!firstStart) replaceProgress(next);
    const priorCourse = currentCourse.current;
    const earned = applyBadges(priorCourse, next);
    if (earned !== priorCourse) replaceCourse(earned);
    return enqueue(async () => {
      await writeProgress(next);
      if (earned !== priorCourse) await writeCourse(earned);
      if (firstStart) replaceProgress(next);
    });
  }

  function updateLesson(id: string, change: (previous: CourseRecord) => CourseRecord) {
    if (restoring.current) return;
    const prior = currentCourse.current;
    const next = applyBadges({ ...prior, records: { ...prior.records, [id]: change(prior.records[id] ?? emptyLesson()) } }, currentProgress.current);
    replaceCourse(next);
    void enqueue(() => writeCourse(next));
  }

  const [page, selection, lessonId, focus] = where;
  const lesson = page === "lesson" && [...lessons, ...milestones.lessons].find(item => item.id === `${selection}/${lessonId}`);
  function back() {
    if(historyDepth.current>0) {history.back(); return;}
    if((page==="soc"||page==="pentest")&&lessonId) location.hash=`#/${page}/${selection}`;
    else if((page==="soc"||page==="pentest")&&selection) location.hash=`#/${page}`;
    else if(page==="lesson") location.hash=selection==="milestones"?"#/assessments":`#/module/${selection}`;
    else if(page==="module") location.hash="#/modules";
    else location.hash="#/";
  }
  useEffect(()=>{
    const shortcut=(event:KeyboardEvent)=>{
      if (!((event.altKey&&event.key==="ArrowLeft")||(event.metaKey&&event.key==="["))) return;
      event.preventDefault();
      document.querySelector<HTMLButtonElement>("[data-nex-back]")?.click();
    };
    window.addEventListener("keydown",shortcut);
    return ()=>window.removeEventListener("keydown",shortcut);
  },[]);
  const combined = missionCount(data,"soc")+missionCount(data,"pentest");
  const track: Track | undefined = page === "soc" || page === "pentest" ? page : undefined;
  const navPage = crashPages.includes(page) || (lesson && selection === "milestones") ? "crash" : fullPages.includes(page) || lesson ? "course" : page;
  const title = navigation.flatMap(group => group.links).find(link => link.id === navPage)?.title ?? "Home";
  let content: ReactNode;
  if (!today || !loaded) content = <div className="panel loading">{warning ? <div className="actions">
    <button className="button subtle" onClick={() => location.reload()}>Retry opening local data</button>
    {native() && <button className="button subtle" onClick={() => void desktop.openFolder().catch(error => setWarning(errorText(error)))}>Open data folder</button>}
  </div> : "Loading your workspace…"}</div>;
  else if (!data.start && crashPages.includes(page) && page !== "assessments") content = <><CrashNav/><Welcome today={today} update={update} /></>;
  else if (track) content = <><CrashNav/><TrackView key={track} track={track} selection={selection} focus={lessonId} data={data} today={today} update={update} course={course} saveQuiz={(id,attempt)=>updateLesson(id,record=>({...record,attempts:[...record.attempts.slice(-99),attempt]}))} /></>;
  else if (page === "calendar") content = <><CrashNav/><CalendarView data={data} today={today} /></>;
  else if (page === "activity") content = <><CrashNav/><h1>Crash Course Learning History</h1><Analytics data={data} today={today} /></>;
  else if (page === "crash") content = <><CrashNav/><Dashboard data={data} today={today} /></>;
  else if (fullPages.includes(page) || page === "assessments") content = <FullCourse state={course} page={page} selection={selection} chooseModule={id => {
    if (restoring.current) return;
    const next = {...currentCourse.current, preferredModule:id};
    replaceCourse(next);
    void enqueue(() => writeCourse(next));
  }} />;
  else if (lesson) content = <LessonView key={lesson.id} lesson={lesson} state={course} update={updateLesson} focus={focus} />;
  else if (page === "report") content = <CompletionReport crash={data} course={course} today={today} track={selection==="soc"||selection==="pentest"?selection:undefined}/>;
  else if (page === "progress") content = <LearningStats state={course} crash={data} today={today} />;
  else if (page === "achievements") content = <Achievements state={course} crash={data} />;
  else if (page === "notes") content = <Notes state={course} crash={data} />;
  else if (page === "settings") content = <Settings data={data} today={today} update={update} restoreBackup={async token => {
    restoring.current = true;
    try {
      if (!await writes.current) throw new Error("Retry saving before restoring.");
      const restored = await desktop.restore(token);
      const restoredCourse = await readCourse();
      const earned = applyBadges(restoredCourse, restored);
      replaceProgress(restored);
      replaceCourse(earned);
      if (earned !== restoredCourse) await writeCourse(earned);
      setReducedMotion(await readReducedMotion());
    } finally { restoring.current = false; }
  }} flush={() => writes.current} reducedMotion={reducedMotion} saveMotion={async enabled => {
    await writeReducedMotion(enabled);
    setReducedMotion(enabled);
  }} />;
  else content = <Home crash={data} state={course} today={today}/>;
  return <div className={`shell nex-shell ${reducedMotion ? "is-reduced" : ""}`}>
    <a href="#main-content" className="skip" onClick={event => { event.preventDefault(); document.getElementById("main-content")?.focus(); }}>Skip to content</a>
    {mobile && <button className="scrim" aria-label="Close navigation" onClick={closeMenu} />}
    <aside className={mobile ? "sidebar open" : "sidebar"}>
      <a className="brand" href="#/" aria-label="CyberNex Home">
        <Image className="cybernex-brand-icon" src="/icon.png" width={42} height={42} alt="" unoptimized />
        <span>Cyber<span className="brand-number">Nex</span><small>SECURITY LEARNING</small></span>
      </a>
      <button className="mobile-close icon-button" ref={closeNavigation} aria-label="Close navigation" onClick={closeMenu}><X size={20} /></button>
      <nav aria-label="Main navigation">
        {navigation.map(group => <div className="nav-group" key={group.title}>
          <p>{group.title}</p>{group.links.map(({ id, title, icon: Icon }) =>
            <a key={id} className={`nav-link ${id === navPage ? "selected" : ""} ${id}`} href={`#/${id}`} aria-current={id === navPage ? "page" : undefined}><Icon size={18} /><span>{title}</span></a>)}
        </div>)}
      </nav>
      <div className="sidebar-bottom">
        <a href="#/progress" className="journey-block"><span><span className="journey-icon"><Activity size={15} /></span> Crash Course</span><strong>{combined} / 240</strong><span className="mini-meter"><i style={{width:`${combined/240*100}%`}} /></span>{!data.start&&<small>Choose a start date</small>}</a>
        <a href="#/settings" className="local-label"><CircleHelp size={15} /> Progress stored locally</a>
      </div>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <button className="menu-toggle icon-button" ref={menuToggle} aria-label="Open navigation" aria-expanded={mobile} onClick={() => setMobile(true)}><Menu size={22} /></button>
        {page && <div className="route-actions"><button data-nex-back className="button subtle" type="button" onClick={back}><ArrowLeft size={15}/>Back</button><a className="button subtle" href="#/"><House size={15}/>Home</a></div>}
        <div className="breadcrumbs"><span>Home</span><ChevronRight size={14} /><strong>{track ? trackInfo[track].name : title}{track && selection && /^\d+$/.test(selection)?` · Mission ${selection}`:""}</strong></div>
        <time dateTime={today || undefined}><CalendarDays size={16} />{today ? displayDay(today, { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "Europe/Paris"}</time>
      </header>
      <main className="main" id="main-content" tabIndex={-1}>
        {warning && <div role="alert" className="notice">{warning} {loaded && <button className="button subtle" onClick={() => retrySave.current()}>Retry save</button>}</div>}
        <div role="status" className="save-state">{saveStatus}</div>
        <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
          <motion.div key={page} initial={reducedMotion ? false : { opacity: .84, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .18 }}>{content}</motion.div>
        </MotionConfig>
      </main>
    </div>
  </div>;
}
