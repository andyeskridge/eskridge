import { Database } from "bun:sqlite";
import { mkdir, mkdtemp, readdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { bun } from "./cloudflare";
import { snapshotD1 } from "./d1-snapshot";

const destination = await mkdtemp(join(tmpdir(), "eskridge-emdash-restore-"));
const expected = JSON.parse(
  await bun(
    [
      "x",
      "wrangler",
      "d1",
      "execute",
      "DB",
      "--local",
      "--json",
      "--command",
      "SELECT id FROM ec_posts ORDER BY created_at DESC LIMIT 1",
    ],
    {},
    true,
  ),
)[0].results[0].id;
const storage = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
let source: Database | undefined;
for (const filename of await readdir(storage)) {
  if (!/^[a-f0-9]{64}\.sqlite$/.test(filename)) continue;
  const candidate = new Database(join(storage, filename), { readonly: true });
  try {
    if (candidate.query("SELECT id FROM ec_posts WHERE id=?").get(expected)) {
      if (source)
        throw new Error(
          "Ambiguous local database; do not guess a restoration source.",
        );
      source = candidate;
      continue;
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Ambiguous"))
      throw error;
  }
  candidate.close();
}
if (!source) throw new Error("Could not identify the local D1 file.");
const sourceDatabase = source;
const query = async (sql: string) =>
  sourceDatabase.query(sql).all() as Record<string, unknown>[];
await snapshotD1(join(destination, "database.sql"), query);
const database = new Database(join(destination, "restored.sqlite"));
database.run("PRAGMA foreign_keys=ON");
database.run("BEGIN");
database.run(await readFile(join(destination, "database.sql"), "utf8"));
database.run("COMMIT");
const integrity = database.query("PRAGMA integrity_check").get() as {
  integrity_check: string;
};
if (integrity.integrity_check !== "ok")
  throw new Error("Restored SQLite integrity check failed.");
if (database.query("PRAGMA foreign_key_check").all().length)
  throw new Error("Restored foreign-key check failed.");
const tables = database
  .query("SELECT name FROM sqlite_master WHERE type='table'")
  .all() as { name: string }[];
for (const name of [
  "users",
  "ec_pages",
  "ec_posts",
  "ec_projects",
  "_emdash_comments",
  "revisions",
])
  if (!tables.some((table) => table.name === name))
    throw new Error(`Raw restore omitted ${name}.`);
const result = {
  testedAt: new Date().toISOString(),
  integrity: integrity.integrity_check,
  tableCount: tables.length,
  scope:
    "Local raw D1 SQL restoration into isolated SQLite. Remote media and owner-authentication recovery require separate checks.",
};
await mkdir("output/recovery", { recursive: true });
await writeFile(
  "output/recovery/local-restore.json",
  JSON.stringify(result, null, 2),
);
database.close();
source.close();
console.log(JSON.stringify(result));
