const playwrightPackageName = "@playwright/test";
const semverPattern = /\d+\.\d+\.\d+(?:[-+][\w.-]+)?/;

export const getPlaywrightVersion = (packageJson) => {
  const versionRange =
    packageJson.devDependencies?.[playwrightPackageName] ??
    packageJson.dependencies?.[playwrightPackageName];

  if (!versionRange) {
    throw new Error(`Unable to find ${playwrightPackageName} in package.json`);
  }

  const version = versionRange.match(semverPattern)?.[0];
  if (!version) {
    throw new Error(
      `Unable to parse ${playwrightPackageName} version "${versionRange}"`
    );
  }

  return version;
};

export const getDefaultPlaywrightDockerImage = (packageJson) =>
  `mcr.microsoft.com/playwright:v${getPlaywrightVersion(packageJson)}-noble`;
