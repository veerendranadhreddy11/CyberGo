import { test, expect, type Page } from "@playwright/test";
import { join } from "node:path";

async function photo(page:Page,name:string) {
  if(process.env.CYBERNEX_SCREENSHOTS) await page.screenshot({path:join(process.env.CYBERNEX_SCREENSHOTS,name+".png"),animations:"disabled"});
}

test("full course works from Home, stores quiz answers and notes, and resumes offline", async ({page,context})=>{
  await page.goto("/");
  await expect(page.getByRole("heading",{name:"CyberNex",exact:true})).toBeVisible();
  await photo(page,"home");
  await page.getByRole("link",{name:"Explore Full Course"}).click();
  await expect(page.getByRole("heading",{name:"Full Cybersecurity Course",exact:true})).toBeVisible();
  await photo(page,"full-course");
  await page.getByRole("link",{name:"All Modules",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Learning roadmap"})).toBeVisible();
  await photo(page,"roadmap");
  await page.getByRole("link",{name:"Full Cybersecurity Course",exact:true}).click();
  await page.getByRole("link",{name:"Continue learning"}).click();
  await expect(page.getByRole("heading",{name:"How a computer handles work"})).toBeVisible();
  await page.getByRole("radio",{name:"Persistent storage"}).check();
  await page.getByRole("button",{name:"Check answer"}).click();
  await expect(page.getByText("Correct · 100%")).toBeVisible();
  await page.getByRole("textbox",{name:"Learning notes"}).fill("CPU and disk can be separate bottlenecks.");
  await page.getByRole("checkbox",{name:/Explain the concept/}).check();
  await page.getByRole("checkbox",{name:/Finish the exercise/}).check();
  await page.getByRole("button",{name:"Mark lesson complete"}).click();
  await expect(page.getByText("Saved locally",{exact:true})).toBeVisible();
  await page.getByRole("link",{name:"120-Day Crash Course",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Welcome to CyberNex"})).toBeVisible();
  await page.getByRole("checkbox",{name:/Confirm/}).check();
  await page.getByRole("button",{name:"Begin journey"}).click();
  await expect(page.getByRole("heading",{name:"Mission Control"})).toBeVisible();
  await photo(page,"crash-course");
  await page.getByRole("link",{name:"SOC Analyst",exact:true}).click();
  await expect(page.getByRole("heading",{name:/Build and Explore/})).toBeVisible();
  await photo(page,"soc");
  await page.getByRole("link",{name:"Penetration Testing",exact:true}).click();
  await expect(page.getByRole("heading",{name:/Validate Your Lab/})).toBeVisible();
  await photo(page,"pentesting");
  for (const box of await page.getByRole("checkbox").all()) await box.check();
  await page.getByRole("button",{name:"Mark Pentesting mission complete"}).click();
  await expect(page.getByText("Saved locally",{exact:true})).toBeVisible();
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  const artwork=await page.evaluate(async()=>{
    const cache=await caches.open((await caches.keys()).find(name=>name.startsWith("cybernex-"))!);
    const requests=(await cache.keys()).filter(request=>new URL(request.url).pathname.startsWith("/art/"));
    return Promise.all(requests.map(async request=>Boolean((await fetch(request)).ok)));
  });
  expect(artwork).toHaveLength(14);
  expect(artwork.every(Boolean)).toBe(true);
  await page.getByRole("link",{name:"Full Cybersecurity Course",exact:true}).click();
  await page.getByRole("link",{name:"Continue learning"}).click();
  await expect(page.getByRole("heading",{name:"Processes, memory, and privileges"})).toBeVisible();
  await page.goto("/#/lesson/computers/architecture");
  await expect(page.getByRole("textbox",{name:"Learning notes"})).toHaveValue("CPU and disk can be separate bottlenecks.");
  await expect(page.getByText("Correct · 100%")).toBeVisible();
  await expect(page.getByRole("heading",{name:"Lesson complete"})).toBeVisible();
  await page.goto("/#/module/networking");
  await page.getByRole("button",{name:"Study this module next"}).click();
  await expect(page.getByText("Saved locally",{exact:true})).toBeVisible();
  await page.goto("/#/course");
  await page.reload();
  await page.getByRole("link",{name:"Continue learning"}).click();
  await expect(page.getByRole("heading",{name:"OSI layers and TCP/IP"})).toBeVisible();
});
