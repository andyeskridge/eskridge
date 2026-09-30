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
    baseURL: "http://127.0.0.1:4322",
    trace: "retain-on-failure",
    ...(process.env.PLAYWRIGHT_CHANNEL
      ? { channel: process.env.PLAYWRIGHT_CHANNEL }
      : {}),
  },
  webServer: {
    // Use the runner's absolute executable so Windows shell PATH cannot select
    // a different runtime. Keep fixtures separate from the owner's dev server.
    command: `"${process.execPath}" node_modules/astro/bin/astro.mjs dev --host 127.0.0.1 --port 4322 --ignore-lock`,
    url: "http://127.0.0.1:4322",
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      ASTRO_DEV_BACKGROUND: "1",
      SITE_URL: "http://127.0.0.1:4322",
      ESKRIDGE_E2E: "1",
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
});
