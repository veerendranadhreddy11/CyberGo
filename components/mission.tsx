"use client";
import { useEffect, useState } from "react";
import { CheckCheck, Clipboard, Download, FileText, Paperclip, Trash2 } from "lucide-react";
import { deleteEvidence, download, getEvidence, saveEvidence } from "../lib/evidence";
import { checklistPercent, finishMission, freshMission, status } from "../lib/progress";
import { getMission, trackInfo } from "../lib/catalog";
import type { Day, Evidence, Mission, MissionProgress, Progress } from "../lib/types";
import { Meter, Status, trackHref } from "./shared";
import { desktop, errorText, native, type NativeEvidence } from "../lib/desktop";
import type { UpdateProgress } from "./settings";
import { missionGuides, missionTeaching } from "../lib/teaching";
import { missionCount, milestoneDays, nextMission } from "../lib/journey";
import type { CourseRecord } from "../lib/course";
import { KnowledgeCheck } from "./knowledge";

export function MissionDetail({ mission, data, today, current, update, locked, focus, quiz, saveQuiz }: { mission: Mission; data: Progress; today: Day; current: number; update: UpdateProgress; locked: boolean; focus?: string; quiz?: CourseRecord; saveQuiz: (attempt:CourseRecord["attempts"][number])=>void }) {
  const entry = data.missions[mission.id] ?? freshMission();
  const [copied, setCopied] = useState("");
  const [celebration, setCelebration] = useState(false);
  const [saving, setSaving] = useState(false);
  const teaching = missionTeaching[mission.id];
  const next = nextMission(data,mission.track);
  const done = missionCount(data,mission.track);
  const following = getMission(mission.track,mission.day+1);
  useEffect(()=>{
    if(!focus) return;
    const target=document.getElementById("mission-"+focus);
    if(target){target.focus();target.scrollIntoView({block:"start"});}
  },[focus]);
  const progress = checklistPercent(entry, mission);
  const edit = (change: (value: MissionProgress) => MissionProgress) => update(state => ({
    ...state, missions: { ...state.missions, [mission.id]: change(state.missions[mission.id] ?? freshMission()) }
  }));
  const copy = async (value: string, name: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(`${name} copied.`); }
    catch { setCopied("Select the text to copy it from this browser."); }
  };
  return <>
    {celebration && <section className={`panel lesson-content completion celebration ${done===120||milestoneDays.includes(done)?"badge-unlocked":""}`} aria-labelledby="mission-celebration">
      <h2 id="mission-celebration">{done===120?"Congratulations!":"Mission complete!"}</h2>
      <p>Mission {mission.day} · {mission.title}</p><p>{teaching.motivation}</p>
      <p>{done} / 120 missions · {(done/1.2).toFixed(1)}%{milestoneDays.includes(done)?` · ${done}-mission milestone`:""}</p>
      <div className="actions">
        {next?<a className="button primary" href={trackHref(mission.track,next.day)}>Continue to Next Mission</a>:<a className="button primary" href={`#/report/${mission.track}`}>View completion report</a>}
        <a className="button subtle" href="#/crash">Return to Dashboard</a><button className="button subtle" onClick={()=>setCelebration(false)}>Dismiss</button>
      </div>
    </section>}
    <div className="mission-columns">
    <article className="panel mission-body">
      <div className="mission-title"><span className="team">{trackInfo[mission.track].phases[Math.floor((mission.day - 1) / 30)]}</span><h2>{mission.title}</h2><p>{mission.objective}</p></div>
      <div className="actions"><a className="button subtle" href={`${trackHref(mission.track,mission.day)}/practice`}>Practical Exercise</a><a className="button subtle" href={`${trackHref(mission.track,mission.day)}/evidence`}>Evidence Manager</a></div>
      <section><h3>Learn</h3><p>{teaching.theory}</p><p>{teaching.relevance}</p><p><strong>In this mission</strong> {mission.objective}</p></section>
      <section><h3>Understand</h3><p>{teaching.example}</p><p>In the provided sample, begin at <code>{teaching.pivot}</code>. {teaching.analysis}</p></section>
      <section><h3>Visual explanation</h3><div className="study-flow" role="img" aria-label="Observe the sample, interpret its context, and record the conclusion"><span>1. Observe the sample</span><span>2. Interpret the context</span><span>3. Record the conclusion</span></div></section>
      <section><h3>Prerequisites and required tools</h3><p><strong>Operating system</strong> · {mission.platform}</p>
        {mission.previous?<p>Review <a className="text-link" href={trackHref(mission.track,mission.previous)}>Mission {mission.previous} · {getMission(mission.track,mission.previous).title}</a> before this exercise.</p>:<p>Read the explanation above before opening the example. The bundled practice record can be studied without external software.</p>}
        <h3>Download and installation</h3><p>Official downloads require internet access. Use the bundled practice data for the offline path.</p>
        {missionGuides(mission).map(guide=><details key={guide.key}><summary>{guide.tools.join(", ")}</summary><p>{guide.purpose}</p><p><strong>Platforms</strong> {guide.systems}</p><p><strong>Requirements</strong> {guide.requirements}</p><p>{guide.install}</p><p><strong>Verify and troubleshoot</strong> {guide.verify}</p>{guide.url&&<p><a className="text-link" href={guide.url} target="_blank" rel="noreferrer" onClick={event=>{
          if(native()){event.preventDefault();void desktop.openOfficial(guide.url).catch(error=>setCopied(errorText(error)));}
        }}>Official source (online)</a></p>}</details>)}
      </section>
      <section><h3>Laboratory configuration</h3><p>{mission.setup}</p><ol className="steps"><li>Choose the bundled evidence for an offline exercise. For optional local tools, match the guest architecture to your computer and keep your work inside your approved lab.</li><li>Before booting a VM, record the storage, CPU and memory settings and confirm that adapters connect only to the intended isolated segment.</li><li>Record the expected sources and scope. Confirm that the sample contains the focus observation before starting the exercise.</li></ol></section>
      <section id="mission-practice" tabIndex={-1}><h3>Practical Exercise</h3><ol className="steps">{mission.steps.map(step => <li key={step}>{step}</li>)}</ol></section>
      {mission.sample && <section><div className="chart-head"><h3>Illustrative practice data</h3><button className="icon-button" aria-label="Copy practice artifact" onClick={() => void copy(mission.sample!, "Artifact")}><Clipboard size={17} /></button></div><pre>{mission.sample}</pre><button className="button subtle" onClick={() => download(new Blob([mission.sample!, "\n"], { type: "text/plain" }), "records.txt")}><Download size={16} /> Download artifact</button></section>}
      <section><div className="chart-head"><h3>Command reference</h3><button className="icon-button" aria-label="Copy command" onClick={() => void copy(mission.command, "Command")}><Clipboard size={17} /></button></div><pre>{mission.command}</pre><p role="status" className="small muted">{copied}</p></section>
      <section><h3>Expected results</h3><p>{mission.expected}</p><h3>Troubleshooting</h3><p>{mission.troubleshoot}</p><h3>Evidence to collect</h3><p>{mission.evidence}</p></section>
      <section id="mission-evidence" tabIndex={-1}><EvidenceAttachments id={mission.id} /></section>
      <KnowledgeCheck questions={teaching.questions} record={quiz} save={saveQuiz}/>
      <section><h3>What you learned</h3><p>{mission.expected}</p><p>{teaching.relevance}</p></section>
      <section><h3>Next mission</h3>{following?<><p>Apply what you observed here to the next objective. {following.objective}</p><a className="button subtle" href={trackHref(mission.track,following.day)}>Continue to Mission {following.day}</a></>:<a className="button subtle" href={`#/report/${mission.track}`}>View learning report</a>}</section>
    </article>
    <div className="mission-aside">
      <section className="panel checklist"><div className="chart-head"><h3>Completion checklist</h3><Status value={status(entry, mission.day, current)} /></div><div className="check-progress"><span>{entry.checks.length} / {mission.checklist.length} requirements</span><strong>{progress}%</strong></div><Meter value={progress} label="Checklist progress" />
        <div className="checks">{mission.checklist.map((label, index) => <label key={label}><input type="checkbox" checked={entry.checks.includes(index)} disabled={!!entry.completedAt} onChange={event => { const checked = event.currentTarget.checked; void edit(value => {
          if (value.completedAt) return value;
          return { ...value, checks: checked ? [...new Set([...value.checks, index])] : value.checks.filter(check => check !== index) };
        }); }} /><span>{label}</span></label>)}</div>
        {entry.completedAt ? <><p className="completion"><CheckCheck size={18} /> Mission complete</p><button className="button subtle" onClick={() => edit(value => ({ ...value, completedAt: undefined }))}>Reopen checklist</button></> : <button className="button track-button" disabled={progress !== 100 || locked || saving} onClick={async () => {
          setSaving(true);
          const saved = await update(state => finishMission(state, mission));
          if(saved) setCelebration(true);
          setSaving(false);
        }}><CheckCheck size={18} /> Mark {trackInfo[mission.track].short} mission complete</button>}
        {locked && <p>Complete earlier missions and wait until your selected start date to mark this mission complete.</p>}
      </section>
      <section className="panel checklist notes"><h3>Learning notes</h3><label htmlFor="mission-notes">Notes save as you type</label><textarea id="mission-notes" maxLength={100000} rows={8} placeholder="Observations, commands, problems solved…" value={entry.notes} onChange={event => { const notes = event.currentTarget.value; void edit(value => ({ ...value, notes })); }} /><label>Study time in minutes<input type="number" min={0} max={10080} step={1} value={entry.minutes || ""} placeholder="0" onChange={event => {
        const amount = Number(event.target.value);
        if (Number.isInteger(amount) && amount >= 0 && amount <= 10080) edit(value => ({ ...value, minutes: amount, studiedOn: amount ? value.studiedOn ?? today : undefined }));
      }} /></label>{entry.studiedOn && <label>Study date<input type="date" value={entry.studiedOn} onChange={event => { const studiedOn = event.currentTarget.value; if (studiedOn) void edit(value => ({ ...value, studiedOn })); }} /></label>}</section>
      <div className="mission-nav">{mission.day > 1 && <a className="button subtle" href={trackHref(mission.track, mission.day - 1)}>Previous mission</a>}{mission.day < 120 && <a className="button subtle" href={trackHref(mission.track, mission.day + 1)}>Next mission</a>}</div>
    </div>
  </div></>;
}

export function EvidenceAttachments({ id }: { id: string }) {
  return native() ? <DesktopEvidence key={id} id={id} /> : <EvidencePanel key={id} id={id} />;
}

function EvidencePanel({ id }: { id: string }) {
  const [files, setFiles] = useState<Evidence[]>();
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getEvidence(id).then(value => { if (active) setFiles(value); }, () => { if (active) setError("This browser could not open evidence storage."); });
    return () => { active = false; };
  }, [id]);
  async function attach(uploads: File[]) {
    setError("");
    for (const file of uploads) {
      if (file.size > 20 * 1024 * 1024) { setError(`${file.name} exceeds the 20 MB file limit.`); continue; }
      try {
        const evidence = { id: crypto.randomUUID(), mission: id, name: file.name, blob: file };
        await saveEvidence(evidence);
        setFiles(existing => [...(existing ?? []), evidence]);
      } catch { setError(`Unable to store ${file.name}. Check available browser storage.`); }
    }
  }
  return <section><div className="chart-head"><h3>Mission evidence</h3><label className="button subtle file-label"><Paperclip size={16} /> Attach files<input type="file" multiple disabled={!files} aria-label="Attach evidence files" onChange={event => { void attach(Array.from(event.target.files ?? [])); event.target.value = ""; }} /></label></div>
    <p className="muted small">Files stay in this browser. Download them separately to back them up.</p>
    {error && <p role="alert">{error}</p>}{!files && !error && <p>Loading evidence…</p>}
    {files && (files.length ? <ul className="plain-list evidence-list">{files.map(file => <li key={file.id}><span><FileText size={16} /> {file.name}</span><div className="actions"><button className="icon-button" aria-label={`Download ${file.name}`} onClick={() => download(file.blob, file.name)}><Download size={17} /></button><button className="icon-button" aria-label={`Remove ${file.name}`} onClick={async () => {
      if (!window.confirm(`Remove ${file.name} from this mission?`)) return;
      try { await deleteEvidence(file.id); setFiles(existing => existing?.filter(item => item.id !== file.id)); }
      catch { setError("The file could not be removed."); }
    }}><Trash2 size={17} /></button></div></li>)}</ul> : <p className="empty">No evidence attached.</p>)}
  </section>;
}

function DesktopEvidence({ id }: { id: string }) {
  const [files, setFiles] = useState<NativeEvidence[]>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    void desktop.evidence(id).then(value => { if (active) setFiles(value); },
      cause => { if (active) setError(errorText(cause)); });
    return () => { active = false; };
  }, [id]);
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try { await action(); }
    catch (cause) { setError(errorText(cause)); }
    finally { setBusy(false); }
  }
  return <section>
    <div className="chart-head"><h3>Mission evidence</h3><button className="button subtle" disabled={busy}
      onClick={() => void run(async () => setFiles(await desktop.attach(id)))}><Paperclip size={16} /> Attach file</button></div>
    <p className="muted small">Files are stored on this computer and included in CyberNex ZIP backups.</p>
    {error && <p role="alert">{error}</p>}
    {files && (files.length ? <ul className="plain-list evidence-list">{files.map(file => <li key={file.id}>
      <span><FileText size={16} /> {file.name}</span>
      <div className="actions">
        <button className="button subtle" disabled={busy} onClick={() => void run(async () => { await desktop.review(file.id); })}>Open</button>
        <button className="icon-button" disabled={busy} aria-label={`Export ${file.name}`}
          onClick={() => void run(async () => { await desktop.exportAttachment(file.id); })}><Download size={17} /></button>
        <button className="icon-button" disabled={busy} aria-label={`Remove ${file.name}`} onClick={() => {
          if (window.confirm(`Remove ${file.name} from this mission?`)) void run(async () => {
            await desktop.delete(file.id);
            setFiles(await desktop.evidence(id));
          });
        }}><Trash2 size={17} /></button>
      </div>
    </li>)}</ul> : <p className="empty">No evidence attached.</p>)}
  </section>;
}
