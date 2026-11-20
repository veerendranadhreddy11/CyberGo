"use client";

import { useState } from "react";
import { Download, HardDrive, Upload } from "lucide-react";
import { parseBackup } from "../lib/progress";
import { download } from "../lib/evidence";
import { desktop, errorText, native, type BackupPreview } from "../lib/desktop";
import type { Day, Progress } from "../lib/types";

export type UpdateProgress = (change: (progress: Progress) => Progress, replace?: boolean) => Promise<boolean>;
type Pending = { kind: "zip"; data: BackupPreview } | { kind: "legacy"; data: Progress };

export function Settings({ data, today, update, restoreBackup, flush, reducedMotion, saveMotion }: {
  data: Progress;
  today: Day;
  update: UpdateProgress;
  restoreBackup: (token: string) => Promise<void>;
  reducedMotion: boolean;
  saveMotion: (enabled: boolean) => Promise<void>;
  flush: () => Promise<boolean>;
}) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<Pending>();
  const [busy, setBusy] = useState(false);
  const installed = native();

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try { await action(); }
    catch (error) { setMessage(errorText(error)); }
    finally { setBusy(false); }
  }

  async function inspectLegacy(file: File) {
    setPending(undefined);
    await run(async () => {
      if (file.size > 50_000_000) throw new Error("Choose a JSON backup under 50 MB.");
      try { setPending({ kind: "legacy", data: parseBackup(await file.text()) }); }
      catch (error) { if (error instanceof SyntaxError) throw new Error("This file is not valid JSON."); throw error; }
    });
  }

  return <>
    <div className="page-heading"><h1>Settings</h1><p>Manage display preferences and local backups.</p></div>
    <section className="panel settings-panel">
      <h2>Earlier learning records</h2><p>Open work saved with earlier versions of CyberNex.</p>
      <a className="button subtle" href="#/archive">Open learning archive</a>
    </section>
    <section className="panel settings-panel">
      <div className="chart-head"><h2>Backup and restore</h2><HardDrive size={22} /></div>
      <p>CyberNex saves your learning progress locally on this computer. Your data does not automatically synchronize between devices. Export a backup if you want to move your progress to another computer.</p>
      {installed && <p>Keep a copy of your backup somewhere you can access if you lose this computer. ZIP backups include records and evidence attachments.</p>}
      <div className="actions">
        <button className="button primary" disabled={busy} onClick={() => void run(async () => {
          if (!await flush()) throw new Error("Retry saving your progress before exporting.");
          if (installed) {
            if (await desktop.exportBackup()) setMessage("Backup exported.");
          } else {
            download(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), `cybernex-${today}.backup.json`);
          }
        })}><Download size={17} /> {installed ? "Export my data" : "Export backup"}</button>
        {installed && <>
          <button className="button subtle" disabled={busy} onClick={() => void run(async () => {
            setPending(undefined);
            const preview = await desktop.inspect();
            if (preview) setPending({ kind: "zip", data: preview });
          })}><Upload size={17} /> Import my data</button>
          <button className="button subtle" disabled={busy} onClick={() => void run(async () => { await desktop.openFolder(); })}>Open data folder</button>
        </>}
        <label className="button subtle file-label"><Upload size={17} /> {installed ? "Import browser JSON" : "Select backup"}
          <input type="file" disabled={busy} accept=".json,application/json" aria-label={installed ? "Import browser JSON" : "Select backup"}
            onChange={event => { const file = event.target.files?.[0]; if (file) void inspectLegacy(file); event.target.value = ""; }} />
        </label>
      </div>
      {pending && <div className="notice">
        <p>{pending.kind === "zip"
          ? `Restore ${pending.data.summary.missions} mission records, ${pending.data.summary.lessons} lesson or assessment records, and ${pending.data.summary.attachments} attachments. Start date: ${pending.data.summary.start ?? "unset"}.`
          : `Restore ${Object.keys(pending.data.missions).length} mission records from a browser backup. Existing evidence stays attached to its mission.`}</p>
        <p>Restoring replaces records included in the selected backup. Export your current data first if you want to keep a copy.</p>
        <div className="actions">
          <button className="button primary" disabled={busy} onClick={() => void run(async () => {
            if (!await flush()) throw new Error("Retry saving your progress before restoring.");
            if (pending.kind === "zip") await restoreBackup(pending.data.token);
            else if (!await update(() => pending.data, true)) return;
            setPending(undefined); setMessage("Backup restored.");
          })}>Restore backup</button>
          <button className="button subtle" disabled={busy} onClick={() => void run(async () => {
            if (pending.kind === "zip") await desktop.cancel();
            setPending(undefined);
          })}>Cancel</button>
        </div>
      </div>}
      {message && <p role="status">{message}</p>}
    </section>
    <section className="panel settings-panel">
      <h2>Appearance</h2>
      <label className="motion-setting"><input type="checkbox" disabled={busy} checked={reducedMotion}
        onChange={event => { const checked = event.currentTarget.checked; void run(async () => { await saveMotion(checked); }); }} /> Reduce Animations</label>
    </section>
    <section className="panel settings-panel">
      <h2>About CyberNex</h2>
      <p>Version 2.1.0 · Learn. Practice. Progress.</p>
      <p>Choose a 120-day Crash Course or study the Full Cybersecurity Course at your own pace. Practice in your own authorized lab and use CyberNex to record what you learn.</p>
    </section>
  </>;
}
