import { test, expect } from "@playwright/test";

test.describe("Fun Facts Pagination App", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
  });
  test("loads exactly 10 posts on the first page", async ({ page }) => {
    const notes = page.locator(".note");
    await expect(notes).toHaveCount(10);
  });
  test("disables First and Previous buttons on Page 1", async ({ page }) => {
    const firstBtn = page.locator('button[name="first"]');
    const prevBtn = page.locator('button[name="previous"]');

    await expect(firstBtn).toBeDisabled();
    await expect(prevBtn).toBeDisabled();
  });
  test(`navigates to 2-9 num and enables previous, next, first, last buttons`, async ({
    page,
  }) => {
    for (let num = 2; num <= 9; num++) {
      const nextBtn = page.locator('button[name="next"]');
      const prevBtn = page.locator('button[name="previous"]');
      const firstBtn = page.locator('button[name="first"]');
      const lastBtn = page.locator('button[name="last"]');
      const pageNumBtn = page.locator(`button[name="page-${num}"]`);

      await nextBtn.click();

      await expect(prevBtn).toBeEnabled();

      await expect(nextBtn).toBeEnabled();

      await expect(firstBtn).toBeEnabled();

      await expect(lastBtn).toBeEnabled();

      await expect(pageNumBtn).toBeDisabled();
    }
  });

  test("disables Last and Next buttons on Page 10", async ({ page }) => {
    const lastBtn = page.locator('button[name="last"]');
    const nextBtn = page.locator('button[name="next"]');

    await lastBtn.click();

    await expect(lastBtn).toBeDisabled();

    await expect(nextBtn).toBeDisabled();
  });

  test("check there is text in the notes", async ({ page }) => {
    const firstNote = page.locator(".note").first();
    await expect(firstNote).toBeVisible();
    await expect(firstNote).not.toBeEmpty();
    await expect(firstNote.locator("h2")).not.toBeEmpty();
  });
});
