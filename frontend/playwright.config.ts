import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright-tests',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  use: {
    headless: true,
    baseURL: 'http://localhost:3000',
  },
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'node index.js',
      cwd: '../backend',
      url: 'http://localhost:3001/health',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});
