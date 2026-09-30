import { readFile, writeFile } from "node:fs/promises";
import { parse } from "jsonc-parser";
import {
  bun,
  cfApi,
  environment,
  loadResources,
  migrationReport,
  run,
} from "./cloudflare";
import { validateRecoveryManifest } from "./recovery-manifest";

const target = environment(process.argv[2]);
if (target === "production") {
  const branch = (
    await run(["git", "branch", "--show-current"], {}, true)
  ).trim();
  if (
    branch !== "main" ||
    (process.env.GITHUB_REF && process.env.GITHUB_REF !== "refs/heads/main")
  )
    throw new Error("Production deployments require main.");
}
const resources = await loadResources(target);
const secrets = await cfApi<{ name: string }[]>(
  resources.accountId,
  `/workers/scripts/${resources.worker}/secrets`,
);
for (const name of [
  "EMDASH_ENCRYPTION_KEY",
  "SETUP_ACCESS_TOKEN",
  "TURNSTILE_SECRET_KEY",
])
  if (!secrets.some((item) => item.name === name))
    throw new Error(
      `Missing runtime secret ${name}. Set it with wrangler secret put --env ${target}.`,
    );
const config = parse(await readFile("wrangler.jsonc", "utf8"));
if (!config.env[target].vars.TURNSTILE_SITE_KEY)
  throw new Error("Configure the environment's public TURNSTILE_SITE_KEY.");
// Never embed the challenge secret in Vite's import.meta.env replacement.
await bun(["run", "build"], {
  CLOUDFLARE_ENV: target,
  SITE_URL: resources.siteUrl,
  TURNSTILE_SECRET_KEY: "",
  EMDASH_TURNSTILE_SECRET_KEY: "",
});
const report = await migrationReport(target, resources, "status");
if (report.pending.length && report.knownApplied.length) {
  const backupPath = process.env.RECOVERY_MANIFEST;
  if (!backupPath)
    throw new Error(
      "Schema changes require RECOVERY_MANIFEST from a matching SQL/media/key backup.",
    );
  const backup = JSON.parse(await readFile(backupPath, "utf8"));
  validateRecoveryManifest(backup, resources);
}
await migrationReport(target, resources, "apply");
await migrationReport(target, resources, "check");
await bun(["x", "wrangler", "deploy", "--env", target]);
await migrationReport(target, resources, "check");
const { subdomain } = await cfApi<{ subdomain: string }>(
  resources.accountId,
  "/workers/subdomain",
);
const healthUrl = `https://${resources.worker}.${subdomain}.workers.dev/writing`;
let health: Response | undefined;
for (let attempt = 1; attempt <= 6; attempt++) {
  health = await fetch(healthUrl, {
    redirect: "manual",
    signal: AbortSignal.timeout(30000),
  });
  if (![404, 502, 503, 504].includes(health.status) || attempt === 6) break;
  await health.body?.cancel();
  console.log(
    `Deployment route returned HTTP ${health.status}; checking again in 10 seconds (${attempt}/6).`,
  );
  await Bun.sleep(10000);
}
if (
  health?.status !== 200 ||
  (target === "staging" &&
    !health.headers.get("X-Robots-Tag")?.includes("noindex"))
)
  throw new Error(
    `Deployment health check failed (HTTP ${health?.status ?? "unavailable"}); consult recovery runbook.`,
  );
console.log(`${target} deployed and checked: ${resources.siteUrl}`);
await writeFile(
  `deployment/release-${target}.json`,
  JSON.stringify(
    {
      commit: (await run(["git", "rev-parse", "HEAD"], {}, true)).trim(),
      deployedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);
