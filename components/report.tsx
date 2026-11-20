"use client";
import { useState } from "react";
import { Download, Trophy } from "lucide-react";
import { desktop, errorText, native } from "../lib/desktop";
import { download } from "../lib/evidence";
import { buildPdf, reportLines } from "../lib/report";
import { missionCount, trackElapsed } from "../lib/journey";
import type { CourseState } from "../lib/course";
import type { Day, Progress, Track } from "../lib/types";
import { trackInfo } from "../lib/catalog";

type Props = { crash: Progress; course: CourseState; today: Day };

export function ReportButton({crash,course,today}:Props) {
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  return <div><button className="button primary" disabled={busy} onClick={async()=>{
    setBusy(true);setMessage("");
    try {
      const pdf=buildPdf(reportLines(crash,course,today));
      if (native()) { if(await desktop.exportReport(pdf)) setMessage("Progress report saved."); }
      else { download(new Blob([pdf],{type:"application/pdf"}),"CyberNex-progress.pdf"); }
    } catch(error) {setMessage(errorText(error));}
    finally {setBusy(false);}
  }}><Download size={16}/>Download Progress Report</button>{message && <p role="status">{message}</p>}</div>;
}

export function CompletionReport({crash,course,today,track}:Props & {track?:Track}) {
  const soc=missionCount(crash,"soc"), pentest=missionCount(crash,"pentest");
  const count=track?(track==="soc"?soc:pentest):soc+pentest;
  const total=track?120:240;
  const elapsed=track?trackElapsed(crash,track,today):null;
  return <><section className={`nex-hero compact art-${track??"home"}`}>
    <div className="nex-hero-copy"><Trophy size={26}/><h1>{count===total?track?"Congratulations!":"Dual-Track Achievement":"Learning progress report"}</h1>
      <p>{track?trackInfo[track].name:"SOC and Penetration Testing"} · {count} / {total} missions · {(count/total*100).toFixed(1)}%</p>
      {elapsed!==null&&<p>{elapsed} calendar {elapsed === 1 ? "day" : "days"} · start and final day included</p>}
      {count===total&&<p>Your steady practice has built a record of work you can review and build on.</p>}
    </div>
  </section><section className="panel lesson-content">
    <h2>Learning activity summary</h2>
    {reportLines(crash,course,today).slice(3).filter(Boolean).map((line,index)=><p key={index}>{line}</p>)}
    <ReportButton crash={crash} course={course} today={today}/>
    <div className="actions"><a className="button subtle" href="#/achievements">View Achievements</a>
      <a className="button subtle" href="#/archive">Open learning archive</a><a className="button subtle" href="#/">Return Home</a></div>
  </section></>;
}
