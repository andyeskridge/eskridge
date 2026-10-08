import assert from "node:assert/strict";
import { cp, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { convertV4MiniflareOptions, Miniflare } from "miniflare";
import { unstable_getMiniflareWorkerOptions } from "wrangler";

// Run after build and e2e. Only a disposable copy of the isolated browser
// fixtures is writable. The owner's development/production data is never used.
const directory = await mkdtemp(join(tmpdir(), "eskridge-comment-runtime-"));
let mf;
try {
  await cp(".wrangler/e2e", directory, { recursive: true });
  const { workerOptions, main, externalWorkers } =
    unstable_getMiniflareWorkerOptions("dist/server/wrangler.json");
  assert(main);
  assert.equal(externalWorkers.length, 0);
  const modules = [
    { type: "ESModule", path: main },
    ...(await readdir(dirname(main), { recursive: true }))
      .filter((path) => path.endsWith(".mjs") && path !== "entry.mjs")
      .map((path) => ({ type: "ESModule", path: join(dirname(main), path) })),
  ];
  for (const { path } of modules) {
    const code = await readFile(path, "utf8");
    for (const sentinel of [
      "build-only-turnstile-sentinel",
      "build-only-emdash-turnstile-sentinel",
    ])
      assert(
        !code.includes(sentinel),
        "Build-time challenge keys must not enter deployed modules.",
      );
  }
  const origin = "http://127.0.0.1:4322";
  const used = new Set();
  let calls = 0;
  let expectedSecret = "runtime-only-test-secret";
  const options = (
    secret = expectedSecret,
    alias = "",
    siteKey = "test-site-key",
  ) =>
    convertV4MiniflareOptions({
      cf: false,
      resourcePersistencePath: join(directory, "v3"),
      workers: [
        {
          ...workerOptions,
          name: "site",
          modulesRules: undefined,
          modules,
          modulesRoot: dirname(main),
          bindings: {
            ...workerOptions.bindings,
            ...(process.env.EMDASH_ENCRYPTION_KEY
              ? { EMDASH_ENCRYPTION_KEY: process.env.EMDASH_ENCRYPTION_KEY }
              : {}),
            SITE_ENV: "production",
            SITE_URL: origin,
            TURNSTILE_SITE_KEY: siteKey,
            TURNSTILE_SECRET_KEY: secret,
            EMDASH_TURNSTILE_SECRET_KEY: alias,
          },
          // Intercept Siteverify at the compiled Worker's outbound boundary.
          // No real CAPTCHA/widget, credentials or network services are used.
          outboundService: async (request) => {
            assert.equal(
              request.url,
              "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            );
            assert.equal(request.method, "POST");
            calls++;
            const body = await request.json();
            assert.equal(body.secret, expectedSecret);
            if (body.response === "malformed") return new Response("not json");
            if (body.response === "unavailable")
              return new Response("unavailable", { status: 502 });
            const success =
              body.response !== "invalid" && !used.has(body.response);
            used.add(body.response);
            return Response.json(
              {
                success,
                hostname:
                  body.response === "wrong-host" ? "other.test" : "127.0.0.1",
                action: body.response === "wrong-action" ? "login" : "comment",
              },
              { status: body.response === "http-error" ? 503 : 200 },
            );
          },
        },
      ],
    });
  mf = new Miniflare(options());
  const db = await mf.getD1Database("DB", "site");
  const entry = await db
    .prepare(
      "SELECT id FROM ec_posts WHERE slug = 'a-place-to-think-and-build'",
    )
    .first();
  assert(
    entry,
    "Run browser acceptance to initialize isolated fixtures first.",
  );
  await db
    .prepare("UPDATE ec_posts SET status = 'published' WHERE id = ?")
    .bind(entry.id)
    .run();
  await db.prepare("DELETE FROM _emdash_rate_limits").run();
  const count = async () =>
    (
      await (
        await mf.getD1Database("DB", "site")
      )
        .prepare(
          "SELECT count(*) AS count FROM _emdash_comments WHERE content_id = ?",
        )
        .bind(entry.id)
        .first()
    ).count;
  const before = await count();
  const submit = (turnstileToken) =>
    mf.dispatchFetch(`${origin}/_emdash/api/comments/posts/${entry.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        "X-EmDash-Request": "1",
      },
      body: JSON.stringify({
        authorName: "Runtime test reader",
        authorEmail: "runtime@example.test",
        body: "A local runtime regression comment.",
        turnstileToken,
      }),
    });
  const health = await mf.dispatchFetch(`${origin}/health.json`);
  const healthState = await health.json();
  assert.equal(healthState.environment, "production");
  assert.equal(healthState.application, "emdash@1.2.0");
  const valid = await submit("single-use");
  assert.equal(valid.status, 201, await valid.clone().text());
  assert.equal((await valid.json()).data.status, "pending");
  assert.equal(calls, 1, "Valid submission must call Siteverify exactly once.");
  assert.equal(await count(), before + 1);
  for (const token of [
    "single-use",
    "invalid",
    "wrong-host",
    "wrong-action",
    "malformed",
    "unavailable",
    "http-error",
  ]) {
    const previous = calls;
    const rejected = await submit(token);
    assert.equal(rejected.status, 403, `${token}: ${await rejected.text()}`);
    assert.equal(calls, previous + 1);
    assert.equal(
      await count(),
      before + 1,
      "Rejected tokens must not persist comments.",
    );
  }
  const previous = calls;
  assert.equal((await submit(undefined)).status, 403);
  assert.equal(calls, previous, "Missing token must not call Siteverify.");
  await mf.setOptions(options(""));
  assert.equal((await submit("missing-secret")).status, 503);
  assert.equal(
    calls,
    previous,
    "Missing secret must fail closed before Siteverify.",
  );
  await mf.setOptions(options(expectedSecret, "", ""));
  assert.equal((await submit("missing-site-key")).status, 503);
  assert.equal(calls, previous);
  expectedSecret = "runtime-alias-test-secret";
  await mf.setOptions(options("unused-fallback", expectedSecret));
  const alias = await submit("alias-single-use");
  assert.equal(alias.status, 201, await alias.clone().text());
  assert.equal((await alias.json()).data.status, "pending");
  assert.equal(calls, previous + 1);
  assert.equal(await count(), before + 2);
  console.log(
    "Compiled production comment regression passed: one verification, runtime secret aliases, pending moderation, replay/host/action/error rejection, and missing-secret/site-key denial.",
  );
} finally {
  await mf?.dispose();
  await rm(directory, { recursive: true, force: true });
}
