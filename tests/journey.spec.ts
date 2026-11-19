import { join } from "node:path";
import { test, expect } from "@playwright/test";
import { addDays, parisDay } from "../lib/dates";

async function start(page: import("@playwright/test").Page, path = "/#/crash") {
  await page.goto(path);
  if (process.env.CYBERNEX_SCREENSHOTS && page.viewportSize()?.width === 1280 && path === "/#/crash") {
    await expect(page.getByRole("heading", { name: "Welcome to CyberNex" })).toBeVisible();
    await page.screenshot({ path: join(process.env.CYBERNEX_SCREENSHOTS, "cybernex-welcome.png"), animations: "disabled" });
  }
  await page.getByRole("checkbox", { name: /Confirm/ }).check();
  await page.getByRole("button", { name: "Begin journey" }).click();
  await expect(page.getByRole("heading", { name: "Mission Control" })).toBeVisible();
}

test("desktop journey saves independently across refresh, accepts evidence and archives missed days", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", error => problems.push(error.message));
  await start(page);
  if (process.env.CYBERNEX_SCREENSHOTS) {
    await page.screenshot({ path: join(process.env.CYBERNEX_SCREENSHOTS, "cybernex-dashboard.png"), animations: "disabled" });
  }
  await page.getByRole("link", { name: "SOC Analyst", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Build and Explore/ })).toBeVisible();
  const complete = page.getByRole("button", { name: "Mark SOC mission complete" });
  await expect(complete).toBeDisabled();
  for (const box of await page.getByRole("checkbox").all()) await box.check();
  await expect(complete).toBeEnabled();
  await page.getByRole("textbox", { name: "Notes save as you type" }).fill("Synthetic log review.");
  await page.getByRole("spinbutton", { name: "Study time in minutes" }).fill("55");
  await page.getByLabel("Attach evidence files").setInputFiles({ name: "redacted.txt", mimeType: "text/plain", buffer: Buffer.from("example") });
  await expect(page.getByRole("button", { name: "Download redacted.txt" })).toBeVisible();
  await complete.click();
  await expect(page.getByText("Saved locally", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Mission complete", { exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Notes save as you type" })).toHaveValue("Synthetic log review.");
  await expect(page.getByRole("spinbutton", { name: "Study time in minutes" })).toHaveValue("55");
  await expect(page.getByRole("button", { name: "Download redacted.txt" })).toBeVisible();
  const evidenceDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download redacted.txt" }).click();
  expect((await evidenceDownload).suggestedFilename()).toBe("redacted.txt");
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Remove redacted.txt" }).click();
  await expect(page.getByText("No evidence attached.")).toBeVisible();
  await page.getByRole("link", { name: "Penetration Testing", exact: true }).click();
  await expect(page.getByRole("button", { name: "Mark Pentesting mission complete" })).toBeDisabled();
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await page.getByLabel("Start date", { exact: true }).fill("2025-01-01");
  await page.getByRole("button", { name: "Save start date" }).click();
  await page.getByRole("button", { name: "Confirm date change" }).click();
  await expect(page.getByText("Journey start date saved.")).toBeVisible();
  await page.getByRole("link", { name: "120-Day Crash Course", exact: true }).click();
  await page.getByRole("link", { name: "Mission Calendar", exact: true }).click();
  await expect(page.getByText(/Actual completion dates/)).toBeVisible();
  await page.getByLabel("Phase").selectOption("0");
  await expect(page.getByRole("link", { name: /Mission 01.*Completed/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Mission 02.*Ready to start/ })).toBeVisible();
  expect(problems).toEqual([]);
});

test("mobile navigation stays usable and invalid backups preserve notes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page);
  await page.goto("/#/soc/1");
  await expect(page.getByRole("heading", { name: /Build and Explore/ })).toBeVisible();
  await page.getByRole("textbox", { name: "Notes save as you type" }).fill("Original note");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await page.getByLabel("Select backup").setInputFiles({ name: "invalid.json", mimeType: "application/json", buffer: Buffer.from("{oops") });
  await expect(page.getByText("This file is not valid JSON.")).toBeVisible();
  const exported = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export backup" }).click();
  expect((await exported).suggestedFilename()).toMatch(/\.backup\.json$/);
  await page.goto("/#/soc/1");
  await expect(page.getByRole("textbox", { name: "Notes save as you type" })).toHaveValue("Original note");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  const record = { version: 1, start: parisDay(), missions: { "soc-1": { checks: [0], notes: "Restored note", minutes: 5, studiedOn: parisDay() } } };
  await page.getByLabel("Select backup").setInputFiles({ name: "valid.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(record)) });
  await page.getByRole("button", { name: "Restore backup" }).click();
  await expect(page.getByText("Backup restored.")).toBeVisible();
  await page.goto("/#/soc/1");
  await expect(page.getByRole("textbox", { name: "Notes save as you type" })).toHaveValue("Restored note");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test("previously loaded production missions and notes work offline", async ({ page, context }) => {
  await start(page);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("link", { name: "Enter Pentesting" }).click();
  await expect(page.getByRole("heading", { name: /Validate Your Lab/ })).toBeVisible();
  await page.getByRole("textbox", { name: "Notes save as you type" }).fill("Offline note.");
  await expect(page.getByText("Saved locally", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Notes save as you type" })).toHaveValue("Offline note.");
});


test("a future start requires confirmation and survives reload", async ({ page }) => {
  const today = parisDay();
  await page.goto("/#/crash");
  await expect(page.getByRole("heading", { name: "Welcome to CyberNex" })).toBeVisible();
  await page.getByLabel("Start date").fill(addDays(today, 5));
  await expect(page.getByRole("button", { name: "Begin journey" })).toBeDisabled();
  await page.getByRole("checkbox", { name: /Confirm/ }).check();
  await page.getByRole("button", { name: "Begin journey" }).click();
  await expect(page.getByRole("heading", { name: "Mission Control" })).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Your journey starts on.*5 days to go/)).toBeVisible();
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await expect(page.getByLabel("Start date")).toHaveValue(addDays(today, 5));
});
