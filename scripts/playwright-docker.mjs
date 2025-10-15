#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const logPrefix = '[playwright-docker]';
const containerName = process.env.PLAYWRIGHT_DOCKER_CONTAINER ?? 'playwright-server';
const imageTag = process.env.PLAYWRIGHT_DOCKER_IMAGE ?? 'mcr.microsoft.com/playwright:v1.56.0-jammy';
const host = process.env.PLAYWRIGHT_DOCKER_HOST ?? '127.0.0.1';
const port = process.env.PLAYWRIGHT_DOCKER_PORT ?? '9323';
const wsPath = process.env.PLAYWRIGHT_DOCKER_PATH ?? '/';
const useDocker = (process.env.PLAYWRIGHT_USE_DOCKER ?? 'true') !== 'false';

if (!useDocker) {
  console.log(`${logPrefix} PLAYWRIGHT_USE_DOCKER=false, skipping container startup`);
  process.exit(0);
}

const runDocker = (args, options = {}) => {
  const result = spawnSync('docker', args, { stdio: 'pipe', ...options });
  if (result.status !== 0) {
    const stdout = result.stdout?.toString().trim();
    const stderr = result.stderr?.toString().trim();
    const message = [stdout, stderr].filter(Boolean).join('\n');
    throw new Error(message || `docker ${args.join(' ')}`);
  }
  return result.stdout?.toString().trim() ?? '';
};

const dockerIsAvailable = () => {
  const check = spawnSync('docker', ['info'], { stdio: 'ignore' });
  return check.status === 0;
};

const containerIsRunning = () => {
  const output = runDocker(['ps', '--filter', `name=${containerName}`, '--format', '{{.Names}}']);
  return output.split('\n').some((line) => line.trim() === containerName);
};

const containerExists = () => {
  const output = runDocker(['ps', '-a', '--filter', `name=${containerName}`, '--format', '{{.Names}}']);
  return output.split('\n').some((line) => line.trim() === containerName);
};

const removeContainer = () => {
  try {
    runDocker(['rm', '-f', containerName]);
    console.log(`${logPrefix} removed container "${containerName}"`);
  } catch (error) {
    console.warn(`${logPrefix} failed to remove container "${containerName}": ${error instanceof Error ? error.message : error}`);
  }
};

const startExistingContainer = () => {
  console.log(`${logPrefix} starting existing container "${containerName}"`);
  runDocker(['start', containerName]);
};

const createContainer = () => {
  console.log(`${logPrefix} creating container "${containerName}" from ${imageTag}`);
  const runArgs = [
    'run',
    '-d',
    '--name',
    containerName,
    '--restart',
    'unless-stopped',
    '--ipc=host',
    '--shm-size=1g',
    '--add-host',
    'host.docker.internal:host-gateway',
    '--publish',
    `${host}:${port}:${port}`,
    imageTag,
    '/bin/bash',
    '-lc',
    `npx playwright run-server --host 0.0.0.0 --port ${port} --path ${wsPath}`,
  ];
  runDocker(runArgs);
};

const ensureRunning = () => {
  const status = runDocker(['inspect', '-f', '{{.State.Status}}', containerName]);
  if (status.trim() !== 'running') {
    let logs = '';
    try {
      const result = spawnSync('docker', ['logs', containerName], { stdio: 'pipe' });
      logs = result.stdout?.toString().trim() ?? result.stderr?.toString().trim() ?? '';
    } catch {
      logs = '';
    }
    const details = logs ? ` Logs:\n${logs}` : '';
    throw new Error(`container status is "${status.trim()}"${details}`);
  }
};

if (!dockerIsAvailable()) {
  console.error(`${logPrefix} docker is not available. Ensure Docker is installed and running.`);
  process.exit(1);
}

try {
  if (containerIsRunning()) {
    console.log(`${logPrefix} container "${containerName}" is already running`);
    process.exit(0);
  }

  const bootContainer = () => {
    if (containerExists()) {
      try {
        startExistingContainer();
      } catch (error) {
        console.warn(`${logPrefix} failed to start existing container: ${error instanceof Error ? error.message : error}`);
        removeContainer();
        createContainer();
      }
    } else {
      createContainer();
    }
  };

  bootContainer();

  try {
    ensureRunning();
  } catch (error) {
    console.warn(`${logPrefix} container failed to start properly: ${error instanceof Error ? error.message : error}`);
    removeContainer();
    createContainer();
    ensureRunning();
  }

  console.log(`${logPrefix} container "${containerName}" is ready on ws://${host}:${port}${wsPath}`);
} catch (error) {
  console.error(`${logPrefix} failed to prepare container: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
