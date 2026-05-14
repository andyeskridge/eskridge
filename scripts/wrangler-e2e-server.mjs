import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const args = [
  "preview",
  "--",
  "--port",
  process.env.WRANGLER_E2E_PORT ?? "8771",
  "--ip",
  process.env.WRANGLER_E2E_IP ?? "0.0.0.0",
  "--log-level",
  process.env.WRANGLER_E2E_LOG_LEVEL ?? "info",
  "--show-interactive-dev-session",
  "false",
];

const localOpenNext = join(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32"
    ? "opennextjs-cloudflare.exe"
    : "opennextjs-cloudflare"
);
const openNextCommand = existsSync(localOpenNext)
  ? localOpenNext
  : "opennextjs-cloudflare";

const openNext = spawn(openNextCommand, args, {
  env: {
    ...process.env,
    FORCE_COLOR: "0",
    NO_COLOR: "1",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

console.log(
  `[worker-e2e] spawned OpenNext preview pid=${openNext.pid} command=${openNextCommand} args=${args.join(" ")}`
);

openNext.stdout.on("data", (chunk) => {
  process.stdout.write(chunk);
});

openNext.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
});

openNext.on("exit", (code, signal) => {
  console.log(
    `[worker-e2e] OpenNext preview exited code=${code} signal=${signal}`
  );
  process.exit(code ?? (signal ? 1 : 0));
});

openNext.on("error", (error) => {
  console.error(
    `[worker-e2e] failed to start OpenNext preview: ${error.message}`
  );
  process.exit(1);
});

const heartbeat = setInterval(() => {
  console.log("[worker-e2e] still waiting for Playwright readiness probe");
}, 10_000);

const shutdown = (signal) => {
  clearInterval(heartbeat);
  if (!openNext.killed) {
    openNext.kill(signal);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
