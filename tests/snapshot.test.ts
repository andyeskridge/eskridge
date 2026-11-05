import { Database } from "bun:sqlite";
import { expect, test } from "bun:test";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { snapshotD1 } from "../scripts/d1-snapshot";

test("raw snapshots preserve private data, blobs, 64-bit integers, rowids and FTS triggers", async () => {
  const source = new Database(":memory:");
  source.run(
    "CREATE TABLE ec_posts (id TEXT PRIMARY KEY, title TEXT, email TEXT, encrypted BLOB, counter INTEGER)",
  );
  source.run(
    "INSERT INTO ec_posts(rowid,id,title,email,encrypted,counter) VALUES(730,'p1','O''Brien <script>','private@example.test',X'0001FF',9223372036854775806)",
  );
  source.run("CREATE VIRTUAL TABLE _emdash_fts_posts USING fts5(title)");
  source.run(
    "INSERT INTO _emdash_fts_posts(rowid,title) SELECT rowid,title FROM ec_posts",
  );
  source.run(
    "CREATE TRIGGER search_update AFTER UPDATE ON ec_posts BEGIN DELETE FROM _emdash_fts_posts WHERE rowid=OLD.rowid; INSERT INTO _emdash_fts_posts(rowid,title) VALUES(NEW.rowid,NEW.title); END",
  );
  const destination = join(
    await mkdtemp(join(tmpdir(), "emdash-snapshot-test-")),
    "database.sql",
  );
  await snapshotD1(
    destination,
    async (sql) => source.query(sql).all() as Record<string, unknown>[],
  );
  const restored = new Database(":memory:");
  restored.run(await readFile(destination, "utf8"));
  expect(
    restored
      .query(
        "SELECT rowid, title, email, hex(encrypted) AS encrypted, quote(counter) AS counter FROM ec_posts",
      )
      .get(),
  ).toEqual({
    rowid: 730,
    title: "O'Brien <script>",
    email: "private@example.test",
    encrypted: "0001FF",
    counter: "9223372036854775806",
  });
  restored.run("UPDATE ec_posts SET title='Recovery works' WHERE id='p1'");
  expect(
    restored
      .query(
        "SELECT rowid FROM _emdash_fts_posts WHERE _emdash_fts_posts MATCH 'Recovery'",
      )
      .get(),
  ).toEqual({ rowid: 730 });
  expect(restored.query("PRAGMA integrity_check").get()).toEqual({
    integrity_check: "ok",
  });
  source.close();
  restored.close();
});
