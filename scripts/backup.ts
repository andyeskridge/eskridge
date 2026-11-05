import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { cfApi, environment, loadResources, run } from "./cloudflare";
import { snapshotD1 } from "./d1-snapshot";

const target = environment(process.argv[2]);
const resources = await loadResources(target);
const release = JSON.parse(
  await readFile(`deployment/release-${target}.json`, "utf8"),
) as { commit: string };
if (
  (await run(["git", "rev-parse", "HEAD"], {}, true)).trim() !==
    release.commit ||
  (
    await run(
      ["git", "status", "--porcelain", "--untracked-files=no"],
      {},
      true,
    )
  ).trim()
)
  throw new Error(
    "Take the backup from the clean matching deployed application commit, before preparing an upgrade.",
  );
if (
  !process.env.R2_ACCESS_KEY_ID ||
  !process.env.R2_SECRET_ACCESS_KEY ||
  !process.env.ENCRYPTION_KEY_FILE ||
  process.env.KEY_ESCROW_VERIFIED !== "1"
)
  throw new Error(
    "Backup requires private R2 S3 credentials, ENCRYPTION_KEY_FILE, and KEY_ESCROW_VERIFIED=1 after verifying the escrow matches the deployed key.",
  );
const { subdomain } = await cfApi<{ subdomain: string }>(
  resources.accountId,
  "/workers/subdomain",
);
const health = (await fetch(
  `https://${resources.worker}.${subdomain}.workers.dev/health.json`,
).then((r) => r.json())) as { readOnly?: boolean };
if (!health.readOnly)
  throw new Error(
    "Set SITE_READ_ONLY=1 on the deployed Worker before taking a consistent database/media snapshot.",
  );
const destination = resolve(
  process.env.BACKUP_DIRECTORY ||
    `.recovery/${target}-${new Date().toISOString().replaceAll(":", "-")}`,
);
await mkdir(`${destination}/media`, { recursive: true });
const manifest = {
  ...resources,
  createdAt: new Date().toISOString(),
  appCommit: (await run(["git", "rev-parse", "HEAD"], {}, true)).trim(),
  lockSha256: createHash("sha256")
    .update(await readFile("bun.lock"))
    .digest("hex"),
  complete: false,
  keyEscrowVerified: false,
  sqlSha256: "",
  media: [] as {
    key: string;
    file: string;
    sha256: string;
    contentType?: string;
    cacheControl?: string;
    metadata?: Record<string, string>;
  }[],
};
await snapshotD1(`${destination}/database.sql`, async (sql) => {
  const result = await cfApi<{ results: Record<string, unknown>[] }[]>(
    resources.accountId,
    `/d1/database/${resources.databaseId}/query`,
    "POST",
    { sql },
  );
  return result.flatMap((item) => item.results);
});
manifest.sqlSha256 = createHash("sha256")
  .update(await readFile(`${destination}/database.sql`))
  .digest("hex");
const client = new S3Client({
  region: "auto",
  endpoint: `https://${resources.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
let continuation: string | undefined;
do {
  const page = await client.send(
    new ListObjectsV2Command({
      Bucket: resources.mediaBucket,
      ContinuationToken: continuation,
    }),
  );
  for (const item of page.Contents ?? []) {
    if (!item.Key) continue;
    const object = await client.send(
      new GetObjectCommand({ Bucket: resources.mediaBucket, Key: item.Key }),
    );
    if (!object.Body) throw new Error("R2 returned an empty object stream.");
    const bytes = await object.Body.transformToByteArray();
    const file = `${createHash("sha256").update(item.Key).digest("hex")}.bin`;
    await writeFile(`${destination}/media/${file}`, bytes);
    manifest.media.push({
      key: item.Key,
      file,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      contentType: object.ContentType,
      cacheControl: object.CacheControl,
      metadata: object.Metadata,
    });
  }
  continuation = page.IsTruncated ? page.NextContinuationToken : undefined;
} while (continuation);
const keyFile = process.env.ENCRYPTION_KEY_FILE;
if (!(await readFile(keyFile, "utf8")).trim())
  throw new Error("Encryption-key escrow is empty.");
await copyFile(keyFile, `${destination}/encryption-key.secret`);
await copyFile("bun.lock", `${destination}/bun.lock`);
await copyFile("wrangler.jsonc", `${destination}/wrangler.jsonc`);
await copyFile(".emdash/migrations.json", `${destination}/migrations.json`);
await run([
  "git",
  "archive",
  "--format=tar",
  `--output=${destination}/application.tar`,
  manifest.appCommit,
]);
manifest.keyEscrowVerified = true;
manifest.complete = true;
await writeFile(
  `${destination}/manifest.json`,
  JSON.stringify(manifest, null, 2),
);
console.log(
  `Backup complete: ${destination}/manifest.json. Transfer this private snapshot to encrypted off-machine storage and test restoration before changing schemas.`,
);
