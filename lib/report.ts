import { activity } from "./progress";
import { applyBadges, badgeNames, completed, lessons, milestones, trackBadges, type CourseState } from "./course";
import { missionCount, trackElapsed } from "./journey";
import type { Day, Progress } from "./types";

export function reportLines(crash: Progress, course: CourseState, today: Day) {
  const soc = missionCount(crash,"soc");
  const pentest = missionCount(crash,"pentest");
  const stats = activity(crash);
  const full = lessons.filter(lesson=>completed(course,lesson)).length;
  const assessments = milestones.lessons.filter(lesson=>completed(course,lesson)).length;
  const checks = Object.values(course.records).reduce((sum,record)=>sum+new Set(record.attempts.map(attempt=>attempt.question??0)).size,0);
  const badgeLabels = Object.keys(applyBadges(course,crash).badges).map(key=>badgeNames[key as keyof typeof badgeNames]??trackBadges[key]?.[0]).filter(Boolean);
  const elapsed = (track: "soc"|"pentest") => {
    const total=trackElapsed(crash,track,today);
    return total===null?"Unavailable":`${total} inclusive calendar days, Europe/Paris`;
  };
  return [
    "CyberNex Learning Progress", `Generated ${today} | Selected start ${crash.start??"Not set"}`,
    "", "Crash Course", `SOC Analyst: ${soc}/120 (${(soc/1.2).toFixed(1)}%) | ${elapsed("soc")}`,
    `Penetration Testing: ${pentest}/120 (${(pentest/1.2).toFixed(1)}%) | ${elapsed("pentest")}`,
    `Crash Course missions completed: ${stats.completed.length}/240 | Logged minutes: ${stats.minutes}`,
    `Practical exercises verified: ${stats.completed.length+full+assessments} (mission, lesson and assessment criteria)`,
    `Optional assessments completed: ${assessments}/${milestones.lessons.length}`,
    "", "Full Cybersecurity Course", `Lessons completed: ${full}/${lessons.length} (${(full/lessons.length*100).toFixed(1)}%)`,
    `Distinct quiz questions answered across both modes: ${checks}`,
    "", "Achievements", ...(badgeLabels.length?badgeLabels.map(label=>`- ${label}`):["No achievements yet."]),
    "", "These figures describe learning activity and practice completion."
  ];
}

export function buildPdf(lines: string[]) {
  // Standard Helvetica and printable ASCII keep the report independent of assets and network.
  const clean = (line: string) => line.normalize("NFKD").replace(/[^\x20-\x7e]/g," ").replace(/[\\()]/g,"\\$&");
  const pages = Array.from({length:Math.max(1,Math.ceil(lines.length/29))},(_,index)=>lines.slice(index*29,index*29+29));
  const objects: string[] = ["<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages.map((_,index)=>`${4+index*2} 0 R`).join(" ")}] /Count ${pages.length} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"];
  for(const [index,page] of pages.entries()){
    const stream = `BT /F1 10 Tf 54 758 Td 23 TL ${page.map(line=>`(${clean(line)}) Tj T*`).join("\n")} ET`;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${5+index*2} 0 R >>`,
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  }
  let pdf="%PDF-1.4\n";
  const offsets=[0];
  for (const [index,obj] of objects.entries()){
    offsets.push(pdf.length);pdf+=`${index+1} 0 obj\n${obj}\nendobj\n`;
  }
  const xref=pdf.length;
  pdf+=`xref\n0 ${offsets.length}\n0000000000 65535 f \n${offsets.slice(1).map(offset=>`${String(offset).padStart(10,"0")} 00000 n \n`).join("")}trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}
