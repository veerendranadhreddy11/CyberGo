export const tracks = ["soc", "pentest"] as const;
export type Track = (typeof tracks)[number];
export type MissionId = `${Track}-${number}`;
export type Day = string;
export interface Mission {
  id: MissionId;
  track: Track;
  day: number;
  title: string;
  minutes: number;
  difficulty: "Foundation" | "Intermediate" | "Advanced";
  platform: string;
  objective: string;
  tools: string[];
  setup: string;
  steps: string[];
  command: string;
  sample?: string;
  expected: string;
  troubleshoot: string;
  evidence: string;
  checklist: string[];
  skills: string[];
  previous?: number;
}
export interface MissionProgress {
  checks: number[];
  notes: string;
  minutes: number;
  studiedOn?: Day;
  completedAt?: string;
}
export interface Progress {
  version: 1;
  start: Day | null;
  missions: Partial<Record<MissionId, MissionProgress>>;
}
export interface Evidence {
  id: string;
  mission: MissionId;
  name: string;
  blob: Blob;
}
