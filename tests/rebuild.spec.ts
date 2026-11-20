import { expect, test } from "@playwright/test";
import { primaryCourses, rebuildPath } from "../lib/rebuild";

for (const track of primaryCourses) {
  test(`${track.name} completes in prerequisite order and persists offline`, async ({ page, context }) => {
    test.setTimeout(60000);
    await page.goto("/");
    const home = page.getByRole("main");
    await expect(home.locator(".nex-mode")).toHaveCount(2);
    await expect(page.getByRole("navigation", { name: "Main navigation" }).getByText(/120.day|Full Cybersecurity Course/)).toHaveCount(0);
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    await context.setOffline(true);
    await page.goto("/" + rebuildPath(track.modules[1].lesson));
    await expect(page.getByRole("alert").getByText("Complete the prerequisite lesson first.")).toBeVisible();
    await page.getByRole("link", { name: "Continue Learning" }).click();
    for (const [index, { lesson }] of track.modules.entries()) {
      await expect(page.getByRole("heading", { name: lesson.title })).toBeVisible();
      if (index === 0) {
        await expect(page.getByRole("heading", { name: "Lesson 1 — What Is a Computer?", exact: true })).toBeVisible();
        await expect(page.getByText("Module 1 — Computer and Cybersecurity Foundations", { exact: false })).toBeVisible();
        await expect(page.getByRole("button", { name: "Question 5", exact: true })).toBeVisible();
        await expect(page.getByRole("main").getByText(/120.Day Crash Course|Full Cybersecurity Course|Mission 01|Suggested 40 min|Build and Explore Your Windows Security Monitoring Lab/)).toHaveCount(0);
      }
      await expect(page.getByRole("button", { name: "Complete lesson", exact: true })).toBeDisabled();
      await page.getByRole("textbox", { name: "Lesson notes" }).fill(`Evidence for ${lesson.title}`);
      for (const control of await page.getByRole("checkbox").all()) await control.check();
      for (const [number, question] of lesson.questions.entries()) {
        await page.getByRole("button", { name: `Question ${number + 1}`, exact: true }).click();
        await page.getByRole("radio", { name: question.choices[question.correct], exact: true }).check();
        await page.getByRole("button", { name: "Check answer" }).click();
        await expect(page.getByText("Correct · 100%")).toBeVisible();
      }
      await page.getByRole("button", { name: "Complete lesson", exact: true }).click();
      await expect(page.getByText(lesson.encouragement)).toBeVisible();
      await page.reload();
      await expect(page.getByText("Lesson complete.", { exact: true })).toBeVisible();
      await expect(page.getByRole("textbox", { name: "Lesson notes" })).toHaveValue(`Evidence for ${lesson.title}`);
      if (index + 1 < track.modules.length) await page.getByRole("link", { name: "Next lesson", exact: true }).click();
    }
    await page.getByRole("link", { name: "Back to course" }).click();
    await expect(page.getByRole("heading", { name: "Passed lesson checks" })).toBeVisible();
    const other = primaryCourses.find(item => item.id !== track.id)!;
    await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: other.name, exact: true }).click();
    await expect(page.getByRole("progressbar", { name: `0 of ${other.modules.length} lessons completed` })).toBeVisible();
  });
}
