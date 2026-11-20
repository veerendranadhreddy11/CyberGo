import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { primaryCourses } from "../lib/rebuild";

test("Back and Home follow actual history and the archive exports a PDF offline", async ({ page, context }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Open SOC Analyst", exact: true }).click();
  await page.getByRole("main").getByRole("link", { name: "Continue Learning", exact: true }).click();
  await expect(page.getByRole("heading", { name: primaryCourses[0].modules[0].lesson.title })).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page).toHaveURL(/#\/learning\/soc$/);
  await page.keyboard.press("Alt+ArrowLeft");
  await expect(page).toHaveURL(/\/$/);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.goto("/#/archive");
  const result = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download Progress Report" }).click();
  const bytes = await readFile((await (await result).path())!);
  expect(bytes.toString()).toContain("SOC Analyst: 0/6 published lessons completed");
  expect(bytes.toString()).toContain("%%EOF");
});
