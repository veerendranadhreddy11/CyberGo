"use client";

import { useState } from "react";
import { displayDay, isDay } from "../lib/dates";
import type { Day } from "../lib/types";
import type { UpdateProgress } from "./settings";

export function Welcome({ today, update }: { today: Day; update: UpdateProgress }) {
  const [date, setDate] = useState<Day>();
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const chosen = date ?? today;
  return <section className="panel settings-panel welcome-panel">
    <h1>Welcome to CyberNex</h1>
    <p>Choose when you want to begin your 120-day cybersecurity journey.</p>
    <form onSubmit={async event => {
      event.preventDefault();
      if (!confirmed || !isDay(chosen) || chosen < today) return;
      setSaving(true);
      if (await update(current => ({ ...current, start: chosen }))) location.hash = "#/crash";
      setSaving(false);
    }}>
      <label>Start date<input type="date" min={today} value={chosen} required
        onChange={event => { setDate(event.target.value); setConfirmed(false); }} /></label>
      <button className="button subtle" type="button" onClick={() => { setDate(today); setConfirmed(false); }}>Start today</button>
      <label className="start-confirm"><span><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /> Confirm {isDay(chosen) ? displayDay(chosen, { dateStyle: "long" }) : "start date"}</span></label>
      <button className="button primary" disabled={!confirmed || saving || !isDay(chosen) || chosen < today}>Begin journey</button>
    </form>
    <p><a className="text-link" href="#/settings">Restore a backup instead</a></p>
  </section>;
}
