const { defineConfig } = require("@playwright/test");
const configuredWorkers = parseInt(process.env.PW_WORKERS || "1", 10);

module.exports = defineConfig({
  testDir: "./playwright/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: Number.isFinite(configuredWorkers) && configuredWorkers > 0 ? configuredWorkers : 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: process.env.FRONTEND_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10000,
  },
  expect: {
    timeout: 10000,
  },
  timeout: 30000,
});
