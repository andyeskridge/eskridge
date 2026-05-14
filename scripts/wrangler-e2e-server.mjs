import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const args = [
  "dev",
  "--local",
  "--port",
  process.env.WRANGLER_E2E_PORT ?? "8771",
  "--ip",
  process.env.WRANGLER_E2E_IP ?? "0.0.0.0",
  "--log-level",
  process.env.WRANGLER_E2E_LOG_LEVEL ?? "debug",
  "--show-interactive-dev-session",
  "false",
];

const localWrangler = join(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "wrangler.exe" : "wrangler"
);
const wranglerCommand = existsSync(localWrangler) ? localWrangler : "wrangler";

const wrangler = spawn(wranglerCommand, args, {
  env: {
    ...process.env,
    FORCE_COLOR: "0",
    NO_COLOR: "1",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

console.log(
  `[wrangler-e2e] spawned wrangler pid=${wrangler.pid} command=${wranglerCommand} args=${args.join(" ")}`
);

wrangler.stdout.on("data", (chunk) => {
  process.stdout.write(chunk);
});

wrangler.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
});

wrangler.on("exit", (code, signal) => {
  console.log(`[wrangler-e2e] wrangler exited code=${code} signal=${signal}`);
  process.exit(code ?? (signal ? 1 : 0));
});

wrangler.on("error", (error) => {
  console.error(`[wrangler-e2e] failed to start wrangler: ${error.message}`);
  process.exit(1);
});

const heartbeat = setInterval(() => {
  console.log("[wrangler-e2e] still waiting for Playwright readiness probe");
}, 10_000);

const shutdown = (signal) => {
  clearInterval(heartbeat);
  if (!wrangler.killed) {
    wrangler.kill(signal);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
