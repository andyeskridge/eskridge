import { defineConfig, devices } from "@playwright/test";

declare const process: { env: Record<string, string>; cwd: () => string };

const dockerHost = process.env.PLAYWRIGHT_DOCKER_HOST ?? '127.0.0.1';
const dockerPort = process.env.PLAYWRIGHT_DOCKER_PORT ?? '9323';

let dockerPath = process.env.PLAYWRIGHT_DOCKER_PATH ?? '/';
if (!dockerPath.startsWith('/')) {
  dockerPath = `/${dockerPath}`;
}
if (dockerPath !== '/' && dockerPath.endsWith('/')) {
  dockerPath = dockerPath.replace(/\/+$/, '');
}

const defaultWsEndpoint = `ws://${dockerHost}:${dockerPort}${dockerPath}`;
const useDockerServer = (process.env.PLAYWRIGHT_USE_DOCKER ?? 'true') !== 'false';
const parsedTimeout = Number.parseInt(process.env.PLAYWRIGHT_CONNECT_TIMEOUT ?? '', 10);
const connectTimeout = Number.isNaN(parsedTimeout) ? 30_000 : parsedTimeout;
const wsEndpoint = process.env.PLAYWRIGHT_WS_ENDPOINT ?? defaultWsEndpoint;
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ??
  (useDockerServer ? 'http://host.docker.internal:8771' : 'http://localhost:8771');

const remoteConnectOptions = useDockerServer
  ? {
      connectOptions: {
        wsEndpoint,
        timeout: connectTimeout,
      },
    }
  : undefined;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        browserName: 'chromium',
        ...(remoteConnectOptions ?? {}),
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        browserName: 'firefox',
        ...(remoteConnectOptions ?? {}),
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        browserName: 'webkit',
        ...(remoteConnectOptions ?? {}),
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "bun run dev:worker",
    url: "http://localhost:8771",
    reuseExistingServer: !process.env.CI,
    cwd: process.cwd(),
  },
});
