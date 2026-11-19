import type { Day } from "./types";
const dayMs = 86_400_000;
const paris = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" });
export function parisDay(date = new Date()): Day {
  const parts = Object.fromEntries(paris.formatToParts(date).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
export function isDay(value: unknown): value is Day {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
}
export function addDays(day: Day, count: number): Day {
  return new Date(Date.parse(day) + count * dayMs).toISOString().slice(0, 10);
}
export function distance(start: Day, end: Day) {
  return (Date.parse(end) - Date.parse(start)) / dayMs;
}
export function journeyDay(start: Day | null, today: Day) {
  return start ? distance(start, today) + 1 : 1;
}
export const displayDay = (day: Day, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) =>
  new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "UTC" }).format(new Date(day));
