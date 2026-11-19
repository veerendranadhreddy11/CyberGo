import { expect, test } from "@playwright/test";
import { reviewLessons } from "../lib/rebuild";

test("both tracks resume independently and all eight review lessons teach and save offline", async ({ page, context }) => {
  test.setTimeout(60000);
  await page.addInitScript(() => {
    if (!localStorage.getItem("cybernex.course")) localStorage.setItem("cybernex.course", JSON.stringify({
      records: { "computers/architecture": { checks: [0], notes: "Legacy notes", attempts: [] } }, badges: {}
    }));
  });
  await page.goto("/");
  await page.getByRole("link", { name: "Review the new curriculum" }).click();
  await expect(page.getByRole("heading", { name: "Curriculum review", exact: true })).toBeVisible();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("link", { name: "Review SOC Analyst" }).click();
  await page.getByRole("link", { name: "Continue Learning" }).click();

  for (const [index, lesson] of reviewLessons.entries()) {
    if (index > 0) {
      await page.getByRole("link", { name: "Back to review track" }).click();
      if (reviewLessons[index - 1].track !== lesson.track) {
        await page.getByRole("link", { name: "Both review tracks" }).click();
        await page.getByRole("link", { name: "Review Red Team" }).click();
      }
      await page.getByRole("link", { name: lesson.title }).click();
    }
    await expect(page.getByRole("heading", { name: lesson.title })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Independent challenge" })).toBeVisible();
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
  }
  await page.getByRole("link", { name: "Notes", exact: true }).click();
  await expect(page.getByText("Legacy notes")).toBeVisible();
  await expect(page.getByRole("link", { name: reviewLessons[0].title })).toBeVisible();
});
