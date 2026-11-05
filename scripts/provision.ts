import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { parse } from "jsonc-parser";
import { cfApi, environment, type Resources } from "./cloudflare";

const target = environment(process.argv[2]);
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!accountId || !/^[a-f0-9]{32}$/i.test(accountId))
  throw new Error("Set the chosen CLOUDFLARE_ACCOUNT_ID first.");
const prefix = `eskridge-emdash-${target}`;
const existing = await cfApi<{ uuid: string; name: string }[]>(
  accountId,
  "/d1/database?per_page=100",
);
const database =
  existing.find((item) => item.name === prefix) ??
  (await cfApi<{ uuid: string; name: string }>(
    accountId,
    "/d1/database",
    "POST",
    { name: prefix },
  ));
const mediaBucket = `eskridge-emdash-media-${target}`;
const buckets = await cfApi<{ buckets: { name: string }[] }>(
  accountId,
  "/r2/buckets?per_page=100",
);
if (!buckets.buckets.some((item) => item.name === mediaBucket))
  await cfApi(accountId, "/r2/buckets", "POST", { name: mediaBucket });
const namespaces = await cfApi<{ id: string; title: string }[]>(
  accountId,
  "/storage/kv/namespaces?per_page=100",
);
const session =
  namespaces.find((item) => item.title === `${prefix}-sessions`) ??
  (await cfApi<{ id: string }>(accountId, "/storage/kv/namespaces", "POST", {
    title: `${prefix}-sessions`,
  }));
const subdomain = await cfApi<{ subdomain: string }>(
  accountId,
  "/workers/subdomain",
);
const siteUrl =
  target === "production"
    ? "https://eskridge.dev"
    : `https://${prefix}.${subdomain.subdomain}.workers.dev`;
// Same canonical target fingerprint used by the installed Cloudflare migration executor.
const targetFingerprint = createHash("sha256")
  .update(
    JSON.stringify({
      kind: "d1",
      identity: [accountId.toLowerCase(), database.uuid.toLowerCase()],
    }),
  )
  .digest("hex");
const selected: Resources = {
  accountId,
  worker: prefix,
  databaseId: database.uuid,
  databaseName: prefix,
  mediaBucket,
  sessionNamespaceId: session.id,
  siteUrl,
  targetFingerprint,
};
await mkdir("deployment", { recursive: true });
let resources: Partial<Record<string, Resources>> = {};
try {
  resources = JSON.parse(await readFile("deployment/resources.json", "utf8"));
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}
if (resources[target] && resources[target]?.databaseId !== selected.databaseId)
  throw new Error(
    "Existing resource manifest points at a different database; inspect before adopting.",
  );
const config = parse(await readFile("wrangler.jsonc", "utf8"));
config.account_id = accountId;
config.env[target].d1_databases[0].database_id = database.uuid;
config.env[target].kv_namespaces[0].id = session.id;
config.env[target].vars.SITE_URL = siteUrl;
await writeFile("wrangler.jsonc", `${JSON.stringify(config, null, 2)}\n`);
await writeFile(
  "deployment/resources.json",
  `${JSON.stringify({ ...resources, [target]: selected }, null, 2)}\n`,
);
console.log(
  `Provisioned ${target}: ${siteUrl}. Review and commit resource identities before deployment. No domain routes were changed.`,
);
