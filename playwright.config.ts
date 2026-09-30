import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 90000,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  outputDir: "output/playwright/results",
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "retain-on-failure",
    ...(process.env.PLAYWRIGHT_CHANNEL
      ? { channel: process.env.PLAYWRIGHT_CHANNEL }
      : {}),
  },
  webServer: {
    command: "bun run dev",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: { ASTRO_DEV_BACKGROUND: "1", SITE_URL: "http://127.0.0.1:4321" },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
});
