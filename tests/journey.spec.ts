import { expect, test } from "@playwright/test";

test("mobile settings reject corrupt JSON and can restore an earlier mission", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/settings");
  await expect(page.getByText("Local backups", { exact: false }).first()).toBeVisible();
  await page.getByLabel("Select backup").setInputFiles({ name: "invalid.json", mimeType: "application/json", buffer: Buffer.from("{oops") });
  await expect(page.getByText("This file is not valid JSON.")).toBeVisible();
  await page.getByLabel("Select backup").setInputFiles({
    name: "valid.json", mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ version: 1, start: "2026-01-02", missions: {
      "soc-1": { checks: [0], notes: "Restored note", minutes: 5 }
    } })),
  });
  await page.getByRole("button", { name: "Restore backup" }).click();
  await expect(page.getByText("Backup restored.")).toBeVisible();
  await page.getByRole("link", { name: "Open learning archive" }).click();
  await page.locator('a[href="#/archive/soc-1"]').click();
  await expect(page.getByText("Restored note")).toBeVisible();
  await expect(page.getByText(/5 minutes logged/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test("archive discovers evidence saved without a progress record", async ({ page }) => {
  await page.goto("/#/pentest/1/evidence");
  await page.getByLabel("Attach evidence files").setInputFiles({ name: "only.txt", mimeType: "text/plain", buffer: Buffer.from("evidence") });
  await expect(page.getByRole("button", { name: "Download only.txt" })).toBeVisible();
  await page.getByRole("link", { name: "All archived records" }).click();
  await page.locator('a[href="#/archive/pentest-1"]').click();
  await expect(page.getByRole("button", { name: "Download only.txt" })).toBeVisible();
});
