import { test, expect, type Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

const registerAndLogin = async (page: Page, username: string) => {
  await page.goto(`${BASE_URL}/create-user`);
  await page.waitForSelector('[data-testid="create_user_form"]');
  await page.fill('[data-testid="create_user_form_name"]', 'Playwright User');
  await page.fill('[data-testid="create_user_form_email"]', `${username}@test.com`);
  await page.fill('[data-testid="create_user_form_username"]', username);
  await page.fill('[data-testid="create_user_form_password"]', 'password123');
  await page.click('[data-testid="create_user_form_create_user"]');

  await expect(page.locator('[data-testid="go_to_login_button"]')).toBeVisible({ timeout: 30000 });

  await page.goto(`${BASE_URL}/login`);
  await page.waitForSelector('[data-testid="login_form"]');
  await page.fill('[data-testid="login_form_username"]', username);
  await page.fill('[data-testid="login_form_password"]', 'password123');
  await page.click('[data-testid="login_form_login"]');

  await expect(page.locator('[data-testid="logout"]')).toBeVisible({ timeout: 30000 });
};

test('CREATE - add a new note', async ({ page }) => {
  const username = `pw_create_${Date.now()}`;
  await registerAndLogin(page, username);

  await page.click('button[name="add_new_note"]');
  await page.fill('input[placeholder="Title"]', 'Playwright Test Title');
  await page.fill('textarea[name="text_input_new_note"]', 'Playwright test note');
  await page.click('button[name="text_input_save_new_note"]');

  await expect(page.locator('.notification')).toHaveText('Added a new note');
});

test('READ - notes are displayed', async ({ page }) => {
  await page.goto(BASE_URL);

  const notes = page.locator('.note');
  await expect(notes.first()).toBeVisible();
  await expect(page.locator('button[name="first"]')).toBeVisible();
  await expect(page.locator('button[name="next"]')).toBeVisible();
});

test('UPDATE - edit a note', async ({ page }) => {
  const username = `pw_update_${Date.now()}`;
  await registerAndLogin(page, username);

  await page.click('button[name="add_new_note"]');
  await page.fill('input[placeholder="Title"]', 'Note To Edit');
  await page.fill('textarea[name="text_input_new_note"]', 'Original content');
  await page.click('button[name="text_input_save_new_note"]');
  await expect(page.locator('.notification')).toHaveText('Added a new note');

  const createdNote = page.locator('.note').filter({ hasText: 'Note To Edit' }).first();
  const noteId = await createdNote.getAttribute('data-testid');

  await page.click(`button[data-testid="edit-${noteId}"]`);
  await page.fill(`textarea[data-testid="text_input-${noteId}"]`, 'Updated by playwright');
  await page.click(`button[data-testid="text_input_save-${noteId}"]`);

  await expect(page.locator('.notification')).toHaveText('Note updated');
});

test('DELETE - delete a note', async ({ page }) => {
  const username = `pw_delete_${Date.now()}`;
  await registerAndLogin(page, username);

  await page.click('button[name="add_new_note"]');
  await page.fill('input[placeholder="Title"]', 'Note To Delete');
  await page.fill('textarea[name="text_input_new_note"]', 'Delete me');
  await page.click('button[name="text_input_save_new_note"]');
  await expect(page.locator('.notification')).toHaveText('Added a new note');

  const createdNote = page.locator('.note').filter({ hasText: 'Note To Delete' }).first();
  const noteId = await createdNote.getAttribute('data-testid');

  await page.click(`button[data-testid="delete-${noteId}"]`);
  await expect(page.locator('.notification')).toHaveText('Note deleted');
  await expect(page.locator(`[data-testid="${noteId}"]`)).toHaveCount(0);
});

test('AI assistant appends generated text to the new note body', async ({ page }) => {
  test.setTimeout(120000);

  const username = `pw_ai_${Date.now()}`;
  await registerAndLogin(page, username);

  await page.click('button[name="add_new_note"]');
  await page.click('[data-testid="help_me_write"]');

  const textarea = page.locator('textarea[name="text_input_new_note"]');
  const before = await textarea.inputValue();

  await page.fill('[data-testid="help_me_write_prompt"]', 'Write a short greeting for my note.');
  await page.click('[data-testid="help_me_write_submit"]');

  await expect
    .poll(async () => (await textarea.inputValue()).length, { timeout: 90000 })
    .toBeGreaterThan(before.length);

  const after = await textarea.inputValue();
  expect(after.length).toBeGreaterThan(0);
});
