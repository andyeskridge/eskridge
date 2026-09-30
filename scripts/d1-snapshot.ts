import { appendFile, writeFile } from "node:fs/promises";

type Query = (sql: string) => Promise<Record<string, unknown>[]>;
const identifier = (value: string) => `"${value.replaceAll('"', '""')}"`;
/** Raw SQL snapshot with rowids, virtual tables, blobs and exact numeric
 * literals. Query SQLite's quote() so REST JSON cannot round 64-bit values.
 * No live table is dropped; FTS shadow tables are recreated by SQLite. */
export async function snapshotD1(destination: string, query: Query) {
  const tables = await query("PRAGMA table_list");
  const application = tables.filter(
    (table) =>
      table.schema === "main" &&
      ["table", "virtual"].includes(String(table.type)) &&
      !String(table.name).startsWith("sqlite_") &&
      !String(table.name).startsWith("_cf_"),
  );
  if (!application.length)
    throw new Error("No application tables found for backup.");
  const schema = await query(
    "SELECT type, name, tbl_name, sql FROM sqlite_schema WHERE sql IS NOT NULL ORDER BY type, name",
  );
  await writeFile(destination, "PRAGMA defer_foreign_keys=TRUE;\n");
  for (const table of application) {
    const definition = schema.find(
      (entry) => entry.type === "table" && entry.name === table.name,
    );
    if (!definition) throw new Error("Missing table definition.");
    if (
      table.type === "virtual" &&
      !String(definition.sql).includes("USING fts5")
    )
      throw new Error("Unsupported virtual table; snapshot is incomplete.");
    await appendFile(destination, `${definition.sql};\n`);
  }
  for (const table of application) {
    const name = String(table.name);
    const columns = (await query(`PRAGMA table_info(${identifier(name)})`)).map(
      (entry) => String(entry.name),
    );
    const values = Number(table.wr) === 1 ? columns : ["rowid", ...columns];
    const prefix = `INSERT INTO ${identifier(name)} (${values.map(identifier).join(",")}) VALUES(`;
    const select = `'${prefix.replaceAll("'", "''")}' || ${values.map((column) => `quote(${identifier(column)})`).join(" || ',' || ")} || ');' AS statement`;
    let offset = 0;
    while (true) {
      const rows = await query(
        `SELECT ${select} FROM ${identifier(name)} ORDER BY ${Number(table.wr) === 1 ? columns.map(identifier).join(",") : "rowid"} LIMIT 500 OFFSET ${offset}`,
      );
      if (!rows.length) break;
      await appendFile(
        destination,
        `${rows.map((row) => row.statement).join("\n")}\n`,
      );
      offset += rows.length;
    }
  }
  if (tables.some((table) => table.name === "sqlite_sequence")) {
    await appendFile(destination, "DELETE FROM sqlite_sequence;\n");
    const sequences = await query(
      "SELECT 'INSERT INTO sqlite_sequence(name,seq) VALUES(' || quote(name) || ',' || quote(seq) || ');' AS statement FROM sqlite_sequence",
    );
    await appendFile(
      destination,
      `${sequences.map((row) => row.statement).join("\n")}\n`,
    );
  }
  const authoritative = new Set(application.map((table) => String(table.name)));
  const secondary = schema.filter(
    (entry) =>
      ["index", "trigger", "view"].includes(String(entry.type)) &&
      !String(entry.name).startsWith("sqlite_") &&
      !String(entry.name).startsWith("_cf_") &&
      (entry.type === "view" || authoritative.has(String(entry.tbl_name))),
  );
  await appendFile(
    destination,
    `${secondary.map((entry) => `${entry.sql};`).join("\n")}\n`,
  );
}
