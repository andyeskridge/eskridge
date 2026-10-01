import { createHash } from "node:crypto";
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
import { commentSettings, legacyRedirects } from "./native-cms";
import { validateRecoveryManifest } from "./recovery-manifest";
import { allowsUpgrade1903WithoutBackup } from "./upgrade-1903-waiver";
import { verifyLive } from "./verify-live";

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
await bun(["run", "build"], {
  CLOUDFLARE_ENV: target,
  SITE_URL: resources.siteUrl,
});
const report = await migrationReport(target, resources, "status");
if (report.pending.length && report.knownApplied.length) {
  const backupPath = process.env.RECOVERY_MANIFEST;
  if (backupPath) {
    const backup = JSON.parse(await readFile(backupPath, "utf8"));
    validateRecoveryManifest(backup, resources);
  } else if (
    allowsUpgrade1903WithoutBackup({
      target,
      resources,
      report,
      parentCommit: (await run(["git", "rev-parse", "HEAD^"], {}, true)).trim(),
      lockSha256: createHash("sha256")
        .update(await readFile("bun.lock"))
        .digest("hex"),
      event: process.env.GITHUB_EVENT_NAME,
      repository: process.env.GITHUB_REPOSITORY,
    })
  ) {
    console.warn(
      "PR #1903: owner-authorized one-time backup waiver for migrations 090–091. No guaranteed data restore is available. Remove this exception after successful deployment.",
    );
  } else {
    throw new Error(
      "Schema changes require RECOVERY_MANIFEST from a matching SQL/media/key backup.",
    );
  }
}
const applied = await migrationReport(target, resources, "apply");
console.log(`Migrations applied: ${applied.executed.join(", ") || "none"}`);
await migrationReport(target, resources, "check");
// A code deploy must not remove legacy routing before the one-time native
// configuration migration has completed on an initialized CMS.
if (report.knownApplied.length) {
  const state = await cfApi<{ results: Record<string, unknown>[] }[]>(
    resources.accountId,
    `/d1/database/${resources.databaseId}/query`,
    "POST",
    {
      sql: "SELECT slug, comments_enabled, comments_moderation, comments_auto_approve_users FROM _emdash_collections",
    },
  );
  const collections = state.flatMap((item) => item.results);
  if (collections.length) {
    for (const [slug, expected] of Object.entries(commentSettings)) {
      const row = collections.find((item) => item.slug === slug);
      if (
        !row ||
        row.comments_enabled !== Number(expected.commentsEnabled) ||
        (slug === "posts" &&
          (row.comments_moderation !== "all" ||
            row.comments_auto_approve_users !== 0))
      )
        throw new Error(
          "Save native comment settings with configure:cms before deployment.",
        );
    }
    const redirects = await cfApi<{ results: { source: string }[] }[]>(
      resources.accountId,
      `/d1/database/${resources.databaseId}/query`,
      "POST",
      { sql: "SELECT source FROM _emdash_redirects" },
    );
    const sources = new Set(
      redirects.flatMap((item) => item.results.map((rule) => rule.source)),
    );
    if (legacyRedirects.some((rule) => !sources.has(rule.source)))
      throw new Error(
        "Install native legacy redirects with configure:cms before deployment.",
      );
  }
}
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
if (target === "production") await verifyLive(resources);
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
