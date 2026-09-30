import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { cfApi } from "./cloudflare";
import { restoreD1 } from "./restore-d1";

const manifestPath = resolve(process.argv[2] || "missing-manifest.json");
const directory = dirname(manifestPath);
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const databaseId = process.env.RESTORE_DATABASE_ID;
const bucket = process.env.RESTORE_MEDIA_BUCKET;
if (
  !accountId ||
  !databaseId ||
  !bucket ||
  !process.env.R2_ACCESS_KEY_ID ||
  !process.env.R2_SECRET_ACCESS_KEY
)
  throw new Error(
    "Set the explicitly isolated restoration D1/R2 targets and private credentials.",
  );
const metadata = await cfApi<{ name: string }>(
  accountId,
  `/d1/database/${databaseId}`,
);
if (
  !metadata.name.startsWith("eskridge-emdash-restore-") ||
  !bucket.startsWith("eskridge-emdash-restore-") ||
  databaseId === manifest.databaseId ||
  bucket === manifest.mediaBucket ||
  !manifest.complete
)
  throw new Error(
    "Restoration is permitted only into isolated eskridge-emdash-restore-* resources.",
  );
const sql = await readFile(`${directory}/database.sql`);
if (createHash("sha256").update(sql).digest("hex") !== manifest.sqlSha256)
  throw new Error("Database snapshot checksum failed.");
const existing = await cfApi<{ results: unknown[] }[]>(
  accountId,
  `/d1/database/${databaseId}/query`,
  "POST",
  {
    sql: "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'",
  },
);
if (existing.some((item) => item.results.length))
  throw new Error(
    "Restore D1 must be empty. Create a new database rather than replacing one.",
  );
const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
const mediaTarget = await client.send(
  new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 1 }),
);
if (mediaTarget.Contents?.length)
  throw new Error("Restore R2 must be empty. Create a new bucket.");
await restoreD1(accountId, databaseId, new TextDecoder().decode(sql));
for (const item of manifest.media) {
  // File names are generated hashes; reject paths before reading any restore object.
  if (!/^[a-f0-9]{64}\.bin$/.test(item.file))
    throw new Error("Invalid media snapshot filename.");
  const bytes = await readFile(`${directory}/media/${item.file}`);
  if (createHash("sha256").update(bytes).digest("hex") !== item.sha256)
    throw new Error("Media snapshot checksum failed.");
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: item.key,
      Body: bytes,
      ContentType: item.contentType,
      CacheControl: item.cacheControl,
      Metadata: item.metadata,
    }),
  );
  const restored = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: item.key }),
  );
  if (
    !restored.Body ||
    createHash("sha256")
      .update(await restored.Body.transformToByteArray())
      .digest("hex") !== item.sha256
  )
    throw new Error("Restored R2 object did not match.");
}
const integrity = await cfApi<{ results: { quick_check: string }[] }[]>(
  accountId,
  `/d1/database/${databaseId}/query`,
  "POST",
  { sql: "PRAGMA quick_check" },
);
if (
  !integrity.length ||
  integrity.some(
    (item) =>
      !item.results.length ||
      item.results.some((row) => row.quick_check !== "ok"),
  )
)
  throw new Error("Restored D1 integrity check failed.");
const foreignKeys = await cfApi<{ results: unknown[] }[]>(
  accountId,
  `/d1/database/${databaseId}/query`,
  "POST",
  { sql: "PRAGMA foreign_key_check" },
);
if (foreignKeys.some((item) => item.results.length))
  throw new Error("Restored D1 foreign-key check failed.");
console.log(
  "SQL and media restored to isolated resources. Bind a separate noindex Worker using the saved application and encryption key, then verify sign-in, private drafts, comments and media before recording recovery acceptance.",
);
