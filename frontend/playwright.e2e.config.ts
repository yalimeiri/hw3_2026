import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright-tests',
  testMatch: '**/*.spec.ts',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  use: {
    headless: true,
    baseURL: 'http://localhost:3000',
  },
});
