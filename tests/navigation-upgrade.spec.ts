import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { parisDay } from "../lib/dates";

test("the actual prior route returns, missions advance today, and a report downloads offline", async ({page,context}) => {
  await page.addInitScript((start)=>{
    if(!localStorage.getItem("cybermission120.progress.v1"))localStorage.setItem("cybermission120.progress.v1",JSON.stringify({version:1,start,missions:{}}));
  },parisDay());
  await page.goto("/");
  await expect(page.getByRole("link",{name:"Open SOC"})).toBeVisible();
  await expect(page.getByRole("link",{name:"Open Pentest"})).toBeVisible();
  await page.getByRole("link",{name:"Open SOC"}).click();
  await expect(page.getByText("Mission 01 / 120")).toBeVisible();
  await page.getByRole("link",{name:"Practical Exercise",exact:true}).click();
  await expect(page).toHaveURL(/\/soc\/1\/practice$/);
  await page.getByRole("button",{name:"Back",exact:true}).click();
  await expect(page).toHaveURL(/#\/soc\/1$/);
  await page.getByRole("link",{name:"Evidence Manager"}).click();
  await expect(page).toHaveURL(/\/soc\/1\/evidence$/);
  await page.keyboard.press("Alt+ArrowLeft");
  await expect(page).toHaveURL(/#\/soc\/1$/);

  for(const check of await page.getByRole("checkbox").all()) await check.check();
  await page.getByRole("button",{name:"Mark SOC mission complete"}).click();
  await expect(page.getByRole("heading",{name:"Mission complete!",exact:true})).toBeVisible();
  await page.getByRole("link",{name:"Continue to Next Mission",exact:true}).click();
  await expect(page.getByText("Mission 02 / 120")).toBeVisible();
  for(const check of await page.getByRole("checkbox").all()) await check.check();
  await page.getByRole("button",{name:"Mark SOC mission complete"}).click();
  await expect(page.getByText(/2 \/ 120 missions · 1.7%/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading",{name:"Mission complete!",exact:true})).toHaveCount(0);
  await page.getByRole("link",{name:"My Progress",exact:true}).click();
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  const filePromise=page.waitForEvent("download");
  await page.getByRole("button",{name:"Download Progress Report"}).click();
  const file=await filePromise;
  const bytes=await readFile((await file.path())!);
  expect(bytes.toString()).toContain("SOC Analyst: 2/120");
  expect(bytes.toString()).toContain("Penetration Testing: 0/120");
  expect(bytes.toString()).toContain("%%EOF");
});

import { catalog } from "../lib/catalog";

test("milestone and final completion appear once and lead to persistent reports", async ({page}) => {
  const completedAt=new Date().toISOString();
  const entries=[...catalog.soc.slice(0,119),...catalog.pentest].map(m=>[
    m.id,{checks:m.checklist.map((_,index)=>index),notes:"Synthetic historical work",minutes:0,completedAt}
  ]);
  await page.addInitScript(({start,entries})=>{
    if(!localStorage.getItem("cybermission120.progress.v1"))localStorage.setItem("cybermission120.progress.v1",JSON.stringify({version:1,start,missions:Object.fromEntries(entries)}));
  },{start:parisDay(),entries});
  await page.goto("/#/soc/120");
  for(const check of await page.getByRole("checkbox").all()) await check.check();
  await page.getByRole("button",{name:"Mark SOC mission complete"}).click();
  await expect(page.getByRole("heading",{name:"Congratulations!"})).toBeVisible();
  await expect(page.getByText(/120-mission milestone/)).toBeVisible();
  await page.getByRole("link",{name:"View completion report"}).click();
  await expect(page.getByText("1 calendar day · start and final day included")).toBeVisible();
  await page.getByRole("link",{name:"View Achievements"}).click();
  await expect(page.getByRole("heading",{name:"Dual-Track Achievement"})).toBeVisible();
  await expect(page.getByRole("article").filter({hasText:"Dual-Track Achievement"}).getByText(/Unlocked/)).toBeVisible();
  await page.goto("/#/soc/120");
  await expect(page.getByText("Mission complete",{exact:true})).toBeVisible();
  await expect(page.getByRole("heading",{name:"Congratulations!"})).toHaveCount(0);
});
