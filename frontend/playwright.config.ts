import { defineConfig } from "@playwright/test";

// reuseExistingServer is true so this works both ways:
//  - standalone (`npx playwright test`): Playwright starts all three.
//  - under presubmission.sh (which pre-starts 3000/3001): Playwright reuses
//    those and only needs to start the attacker server on 4000.
//
// The keylog tests touch a shared file (keylog.txt), so they must not run in
// parallel: workers: 1 keeps test ordering deterministic.
export default defineConfig({
  testDir: "./playwright-tests",
  testMatch: "**/*.spec.ts",
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  expect: {
    timeout: 10000,
  },
  use: {
    headless: true,
    baseURL: "http://localhost:3000",
  },
  webServer: [
    {
      command: "npm run dev",
      url: "http://localhost:3000",
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: "node -r ./dns-fix.cjs index.js",
      cwd: "../backend",
      url: "http://localhost:3001/health",
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: "node attacker_server.js",
      cwd: "..",
      url: "http://localhost:4000/",
      reuseExistingServer: true,
      timeout: 60000,
    },
  ],
});
