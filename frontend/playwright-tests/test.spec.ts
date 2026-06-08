import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test('CREATE - add a new note', async ({ page }) => {
  await page.goto(BASE_URL);
  
  // Click add new note button
  await page.click('button[name="add_new_note"]');
  
  // Fill title, author, and content
  await page.fill('input[placeholder="Title"]', 'Playwright Test Title');
  await page.fill('input[placeholder="Author"]', 'Playwright Author');
  await page.fill('textarea[name="text_input_new_note"]', 'Playwright test note');
  
  // Click save
  await page.click('button[name="text_input_save_new_note"]');
  
  // Check notification
  await expect(page.locator('.notification')).toHaveText('Added a new note');
});

test('READ - notes are displayed', async ({ page }) => {
  await page.goto(BASE_URL);
  
  // Check that notes are visible
  const notes = page.locator('.note');
  await expect(notes.first()).toBeVisible();
  
  // Check pagination buttons exist
  await expect(page.locator('button[name="first"]')).toBeVisible();
  await expect(page.locator('button[name="next"]')).toBeVisible();
});

test('UPDATE - edit a note', async ({ page }) => {
  await page.goto(BASE_URL);
  
  // Get first note's id
  const firstNote = page.locator('.note').first();
  const noteId = await firstNote.getAttribute('data-testid');
  
  // Click edit button
  await page.click(`button[data-testid="edit-${noteId}"]`);
  
  // Clear and type new content
  await page.fill(`textarea[data-testid="text_input-${noteId}"]`, 'Updated by playwright');
  
  // Click save
  await page.click(`button[data-testid="text_input_save-${noteId}"]`);
  
  // Check notification
  await expect(page.locator('.notification')).toHaveText('Note updated');
});

test('DELETE - delete a note', async ({ page }) => {
  await page.goto(BASE_URL);
  
  await expect(page.locator('.note').first()).toBeVisible();
  // Count notes before
  const notesBefore = await page.locator('.note').count();
  
  // Get first note id
  const firstNote = page.locator('.note').first();
  const noteId = await firstNote.getAttribute('data-testid');
  
  // Click delete
  await page.click(`button[data-testid="delete-${noteId}"]`);
  
  // Check notification
  await expect(page.locator('.notification')).toHaveText('Note deleted');
  
  // Check one less note
  await expect(page.locator('.note')).toHaveCount(notesBefore - 1);
});