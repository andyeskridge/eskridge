import { strict as assert } from "node:assert/strict";
import test from "node:test";

import { getDefaultPlaywrightDockerImage } from "./playwright-docker-image.mjs";

test("uses a Docker image matching the Playwright test runner version", () => {
  const packageJson = {
    devDependencies: {
      "@playwright/test": "1.60.0",
    },
  };

  assert.equal(
    getDefaultPlaywrightDockerImage(packageJson),
    "mcr.microsoft.com/playwright:v1.60.0-noble"
  );
});

test("normalizes semver ranges before building the image tag", () => {
  const packageJson = {
    devDependencies: {
      "@playwright/test": "^1.60.0",
    },
  };

  assert.equal(
    getDefaultPlaywrightDockerImage(packageJson),
    "mcr.microsoft.com/playwright:v1.60.0-noble"
  );
});
