import { randomUUID } from "node:crypto";
import { unstable_splitSqlQuery } from "wrangler";
import { cfApi } from "./cloudflare";

/** Import the snapshot as one D1 transaction, preserving trigger bodies and
 * deferred foreign keys. Cloudflare's bulk SQL importer can reset on FTS tables. */
export async function restoreD1(
  accountId: string,
  databaseId: string,
  sql: string,
) {
  const database = await cfApi<{ name: string }>(
    accountId,
    `/d1/database/${databaseId}`,
  );
  if (!database.name.startsWith("eskridge-emdash-restore-"))
    throw new Error("D1 import requires an isolated restoration database.");
  const tables = await cfApi<{ results: unknown[] }[]>(
    accountId,
    `/d1/database/${databaseId}/query`,
    "POST",
    {
      sql: "SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'",
    },
  );
  if (tables.some((item) => item.results.length))
    throw new Error("Restoration database must be empty.");
  const token = `${randomUUID()}${randomUUID()}`.replaceAll("-", "");
  const helper = `eskridge-emdash-restore-import-${randomUUID().replaceAll("-", "").slice(0, 12)}`;
  const code = `export default { async fetch(request, env) {
    if(request.method !== 'POST' || request.headers.get('Authorization') !== 'Bearer '+env.RECOVERY_TOKEN)
      return new Response('Not found', {status:404});
    try {
      const statements = await request.json();
      const results = await env.DB.batch(statements.map(sql => env.DB.prepare(sql)));
      return Response.json({count:results.length,success:results.every(item=>item.success)},
        {headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
    } catch { return Response.json({error:'Recovery transaction failed'}, {status:500}); }
  } }`;
  const form = new FormData();
  form.set(
    "metadata",
    new Blob(
      [
        JSON.stringify({
          main_module: "worker.mjs",
          compatibility_date: "2026-09-29",
          bindings: [
            { name: "DB", type: "d1", id: databaseId },
            { name: "RECOVERY_TOKEN", type: "secret_text", text: token },
          ],
        }),
      ],
      { type: "application/json" },
    ),
  );
  form.set(
    "worker.mjs",
    new Blob([code], { type: "application/javascript+module" }),
    "worker.mjs",
  );
  const uploaded = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${helper}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` },
      body: form,
      signal: AbortSignal.timeout(30000),
    },
  );
  const envelope = (await uploaded.json()) as { success?: boolean };
  if (!uploaded.ok || !envelope.success)
    throw new Error("Could not upload the isolated D1 restoration helper.");
  try {
    await cfApi(accountId, `/workers/scripts/${helper}/subdomain`, "POST", {
      enabled: true,
      previews_enabled: false,
    });
    const { subdomain } = await cfApi<{ subdomain: string }>(
      accountId,
      "/workers/subdomain",
    );
    const statements = unstable_splitSqlQuery(sql);
    for (let attempt = 0; attempt < 12; attempt++) {
      const response = await fetch(
        `https://${helper}.${subdomain}.workers.dev/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(statements),
          signal: AbortSignal.timeout(60000),
        },
      );
      // Only retry a route that has not propagated; never replay a transaction.
      if (response.status === 404 && attempt < 11) {
        await response.body?.cancel();
        await Bun.sleep(5000);
        continue;
      }
      if (!response.ok) throw new Error("Isolated D1 import failed.");
      const result = (await response.json()) as {
        success: boolean;
        count: number;
      };
      if (!result.success || result.count !== statements.length)
        throw new Error("Restoration transaction was incomplete.");
      return;
    }
  } finally {
    await cfApi(accountId, `/workers/scripts/${helper}`, "DELETE");
  }
}
