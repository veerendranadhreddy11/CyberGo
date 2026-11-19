import { Crosshair, ShieldCheck } from "lucide-react";
import type { Track } from "../lib/types";

export const TrackIcon = ({ track, size = 20 }: { track: Track; size?: number }) =>
  track === "soc" ? <ShieldCheck size={size} /> : <Crosshair size={size} />;
export const trackHref = (track: Track, day?: number) => `#/${track}${day ? "/" + day : ""}`;
export const pad = (number: number) => String(number).padStart(2, "0");

export function Meter({ value, label }: { value: number; label: string }) {
  return <div className="meter" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{ width: `${value}%` }} /></div>;
}
export function Ring({ value, mini = false }: { value: number; mini?: boolean }) {
  return <div className={mini ? "ring ring-mini" : "ring"} role="img" aria-label={`${value}% complete`}>
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle className="ring-guide" cx="50" cy="50" r="47" />
      <circle className="ring-track" cx="50" cy="50" r="41" />
      <circle className="ring-value" opacity={value ? 1 : 0} cx="50" cy="50" r="41" pathLength="100" strokeDasharray={`${value} 100`} />
    </svg>
    <div><strong>{value}<small>%</small></strong>{!mini && <span>COMPLETE</span>}</div>
  </div>;
}
export function Status({ value }: { value: string }) {
  return <span className={`status status-${value.toLowerCase().replaceAll(" ", "-")}`}><i />{value}</span>;
}
