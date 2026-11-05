import { readFile } from "node:fs/promises";
import { parse } from "jsonc-parser";

export type Environment = "staging" | "production";
export interface Resources {
  accountId: string;
  worker: string;
  databaseId: string;
  databaseName: string;
  mediaBucket: string;
  sessionNamespaceId: string;
  siteUrl: string;
  targetFingerprint: string;
}
export function environment(value: string | undefined): Environment {
  if (value !== "staging" && value !== "production")
    throw new Error("Choose staging or production explicitly.");
  return value;
}
export async function run(
  args: string[],
  extraEnv: Record<string, string> = {},
  capture = false,
) {
  const child = Bun.spawn(args, {
    env: { ...process.env, ...extraEnv },
    stdout: capture ? "pipe" : "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });
  const output = capture ? await new Response(child.stdout).text() : "";
  const code = await child.exited;
  if (code !== 0)
    throw new Error(`${args.slice(1, 3).join(" ")} failed (${code}).`);
  return output;
}
export const bun = (args: string[], extraEnv = {}, capture = false) =>
  run([process.execPath, ...args], extraEnv, capture);
export async function cfApi<T>(
  accountId: string,
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token)
    throw new Error(
      "Set CLOUDFLARE_API_TOKEN in your private environment; never put it in repository files.",
    );
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}${path}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(30000),
    },
  );
  const envelope = (await response.json()) as {
    success: boolean;
    result: T;
    errors: { code: number; message: string }[];
  };
  if (!response.ok || !envelope.success)
    throw new Error(
      `Cloudflare ${method} ${path}: ${envelope.errors?.map((e) => e.message).join(", ") || response.status}`,
    );
  return envelope.result;
}
export async function loadResources(target: Environment): Promise<Resources> {
  const resources = JSON.parse(
    await readFile("deployment/resources.json", "utf8"),
  ) as Partial<Record<Environment, Resources>>;
  const selected = resources[target];
  if (!selected)
    throw new Error(
      `Provision ${target} first with bun scripts/provision.ts ${target}.`,
    );
  if (
    !/^[a-f0-9]{32}$/i.test(selected.accountId) ||
    !/^[a-f0-9-]{36}$/i.test(selected.databaseId) ||
    !/^[a-f0-9]{64}$/.test(selected.targetFingerprint)
  )
    throw new Error("Invalid pinned resource identity.");
  if (process.env.CLOUDFLARE_ACCOUNT_ID !== selected.accountId)
    throw new Error(
      "Cloudflare account does not match the pinned resource manifest.",
    );
  if (
    target === "production" &&
    process.env.GITHUB_ACTIONS === "true" &&
    (process.env.EMDASH_D1_DATABASE_ID !== selected.databaseId ||
      process.env.EMDASH_D1_TARGET_FINGERPRINT !== selected.targetFingerprint)
  )
    throw new Error(
      "GitHub production database identity does not match the pinned resource manifest.",
    );
  for (const other of Object.values(resources)) {
    if (!other || other === selected) continue;
    if (
      other.databaseId === selected.databaseId ||
      other.mediaBucket === selected.mediaBucket ||
      other.sessionNamespaceId === selected.sessionNamespaceId ||
      other.worker === selected.worker
    )
      throw new Error(
        "Environments must have separate Worker, D1, R2 and KV resources.",
      );
  }
  const config = parse(await readFile("wrangler.jsonc", "utf8"));
  const binding = config.env[target];
  if (
    config.account_id !== selected.accountId ||
    binding.name !== selected.worker ||
    binding.d1_databases[0].database_id !== selected.databaseId ||
    binding.d1_databases[0].database_name !== selected.databaseName ||
    binding.r2_buckets[0].bucket_name !== selected.mediaBucket ||
    binding.kv_namespaces[0].id !== selected.sessionNamespaceId ||
    binding.vars.SITE_URL !== selected.siteUrl
  )
    throw new Error(
      "Wrangler configuration differs from the pinned resource manifest.",
    );
  return selected;
}
export async function migrationReport(
  target: Environment,
  resources: Resources,
  action: "status" | "apply" | "check",
) {
  const args = [
    "x",
    "emdash",
    "migrate",
    "--json",
    "--account-id",
    resources.accountId,
    "--wrangler-config",
    "wrangler.jsonc",
    "--wrangler-env",
    target,
  ];
  if (action === "apply")
    args.push("--expected-target-fingerprint", resources.targetFingerprint);
  else args.push(`--${action}`);
  const report = JSON.parse(
    await bun(args, {}, true),
  ) as import("emdash/migrations").MigrationReport;
  if (
    report.target.fingerprint !== resources.targetFingerprint ||
    report.target.resourceId !== resources.databaseId ||
    report.target.accountId !== resources.accountId ||
    report.target.environment !== target ||
    report.unknownApplied.length ||
    report.lock
  )
    throw new Error(
      "Migration target or migration history does not match; do not deploy.",
    );
  return report;
}
