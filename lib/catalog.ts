import soc from "../curriculum/soc.json";
import pentest from "../curriculum/pentest.json";
import type { Mission, Track } from "./types";

export const catalog: Record<Track, Mission[]> = { soc: soc as Mission[], pentest: pentest as Mission[] };
export const getMission = (track: Track, day: number) => catalog[track][day - 1];
export const trackInfo = {
  soc: { name: "SOC Analyst", short: "SOC", team: "Blue Team", color: "#5fafff", phases: ["Foundations", "SIEM & Detection", "Security Investigations", "Advanced Practice"] },
  pentest: { name: "Penetration Testing", short: "Pentesting", team: "Red Team", color: "#fb718f", phases: ["Foundations & Enumeration", "Web Application Security", "Practical Assessment", "Advanced Laboratories"] }
};
export const phaseIndex = (day: number) => Math.floor((day - 1) / 30);
