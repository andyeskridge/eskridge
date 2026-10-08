import assert from "node:assert/strict";
import { cfApi, type Resources } from "./cloudflare";

export async function verifyLive(resources: Resources) {
  const origin = resources.siteUrl;
  for (const path of ["/", "/writing"]) {
    const response = await fetch(`${origin}${path}`, {
      redirect: "manual",
      signal: AbortSignal.timeout(30000),
    });
    assert.equal(response.status, 200, `Live ${path} failed`);
    await response.body?.cancel();
  }
  const response = await fetch(`${origin}/health.json`, {
    signal: AbortSignal.timeout(30000),
  });
  assert.equal(response.status, 200);
  const health = (await response.json()) as {
    application: string;
    environment: string;
    readOnly: boolean;
  };
  assert.equal(health.application, "emdash@1.2.0");
  assert.equal(health.environment, "production");
  assert.equal(health.readOnly, false);

  const query = async (sql: string, params: string[] = []) =>
    (
      await cfApi<{ results: Record<string, unknown>[] }[]>(
        resources.accountId,
        `/d1/database/${resources.databaseId}/query`,
        "POST",
        { sql, params },
      )
    ).flatMap((item) => item.results);
  const [post] = await query(
    "SELECT id FROM ec_posts WHERE status = 'published' AND deleted_at IS NULL LIMIT 1",
  );
  if (!post) {
    console.log(
      "Live pages/health verified; no published post available for comment rejection check.",
    );
    return;
  }
  // A deliberately absent parent prevents persistence even if CAPTCHA rejection
  // regresses. Never solve CAPTCHA or submit a valid comment during deployment.
  const parentId = "deployment-probe-nonexistent-parent-1903";
  assert.equal(
    (await query("SELECT id FROM _emdash_comments WHERE id = ?", [parentId]))
      .length,
    0,
  );
  for (const token of [undefined, "deployment-probe-invalid-token"]) {
    const rejected = await fetch(
      `${origin}/_emdash/api/comments/posts/${post.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: origin,
          "X-EmDash-Request": "1",
        },
        body: JSON.stringify({
          authorName: "Deployment verification",
          authorEmail: "deployment-probe@example.invalid",
          body: "Rejected security probe",
          parentId,
          turnstileToken: token,
        }),
        signal: AbortSignal.timeout(30000),
      },
    );
    assert.equal(
      rejected.status,
      403,
      "Live comment challenge must reject missing/invalid tokens",
    );
    const body = (await rejected.json()) as { error?: { code?: string } };
    assert.equal(body.error?.code, "TURNSTILE_FAILED");
  }
  assert.equal(
    (
      await query("SELECT id FROM _emdash_comments WHERE parent_id = ?", [
        parentId,
      ])
    ).length,
    0,
  );
  console.log(
    "Live production pages, EmDash version, writable health and missing/invalid comment-token rejection verified; no comment created.",
  );
}
