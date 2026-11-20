import { expect, test } from "@playwright/test";

test("earlier lesson deep links retain notes, quiz history, and evidence", async ({ page, context }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("cybernex.course")) localStorage.setItem("cybernex.course", JSON.stringify({
      records: { "computers/architecture": {
        checks: [0, 1], notes: "Legacy lesson note", attempts: [{ at: "2026-01-02T11:00:00Z", choice: 0, score: 100 }],
        completedAt: "2026-01-02T12:00:00Z",
      } },
      badges: { module: "2026-01-02T12:00:00Z" },
    }));
  });
  await page.goto("/#/lesson/computers/architecture");
  await expect(page.getByRole("heading", { name: "Learning archive" })).toBeVisible();
  await expect(page.getByText("Legacy lesson note")).toBeVisible();
  await expect(page.getByText(/Question 1 · 100%/)).toBeVisible();
  await page.getByLabel("Attach evidence files").setInputFiles({ name: "legacy.txt", mimeType: "text/plain", buffer: Buffer.from("sample") });
  await expect(page.getByRole("button", { name: "Download legacy.txt" })).toBeVisible();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  const file = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download legacy.txt" }).click();
  expect((await file).suggestedFilename()).toBe("legacy.txt");
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Achievements" }).click();
  await expect(page.getByText("Unlocked", { exact: false }).first()).toBeVisible();
});
