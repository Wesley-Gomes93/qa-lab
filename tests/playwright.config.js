const { defineConfig, devices } = require("@playwright/test");
const configuredWorkers = parseInt(process.env.PW_WORKERS || "1", 10);

module.exports = defineConfig({
  testDir: "./playwright/e2e",
  projects: [
    {
      name: "chromium",
      testIgnore: ["**/security/**"],
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "security",
      testMatch: ["**/security/**/*.spec.js"],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.VULNERABLE_WEB_URL || "http://localhost:3001",
      },
    },
  ],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: Number.isFinite(configuredWorkers) && configuredWorkers > 0 ? configuredWorkers : 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "playwright-report/results.json" }],
  ],
  use: {
    baseURL: process.env.FRONTEND_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: process.env.CI ? 15000 : 20000,
    navigationTimeout: process.env.CI ? 15000 : 30000,
  },
  expect: {
    timeout: process.env.CI ? 15000 : 10000,
  },
  timeout: process.env.CI ? 45000 : 30000,
});
