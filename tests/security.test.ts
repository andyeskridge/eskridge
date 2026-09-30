import { describe, expect, test } from "bun:test";
import { validateSeed } from "emdash/seed";
import seed from "../seed/seed.json";
import { verifyCommentChallenge } from "../src/lib/security";

describe("launch and challenge safeguards", () => {
  test("seed is valid and contains only drafts", () => {
    expect(validateSeed(seed).valid).toBe(true);
    for (const entries of Object.values(seed.content))
      for (const entry of entries) expect(entry.status).toBe("draft");
  });
  test("challenge binds hostname and action and fails closed", async () => {
    const fake = (body: unknown, status = 200) =>
      (async () => Response.json(body, { status })) as (
        input: string,
        init: RequestInit,
      ) => Promise<Response>;
    expect(
      await verifyCommentChallenge(
        "token",
        "secret",
        "eskridge.dev",
        fake({ success: true, hostname: "eskridge.dev", action: "comment" }),
      ),
    ).toBe(true);
    for (const body of [
      { success: false },
      { success: true, hostname: "other.test", action: "comment" },
      { success: true, hostname: "eskridge.dev", action: "login" },
    ])
      expect(
        await verifyCommentChallenge(
          "token",
          "secret",
          "eskridge.dev",
          fake(body),
        ),
      ).toBe(false);
    expect(
      await verifyCommentChallenge(
        "",
        "secret",
        "eskridge.dev",
        fake({ success: true }),
      ),
    ).toBe(false);
    expect(
      await verifyCommentChallenge(
        "token",
        "",
        "eskridge.dev",
        fake({ success: true }),
      ),
    ).toBe(false);
    expect(
      await verifyCommentChallenge(
        "token",
        "secret",
        "eskridge.dev",
        (async () => {
          throw new Error("network failed");
        }) as (input: string, init: RequestInit) => Promise<Response>,
      ),
    ).toBe(false);
  });
});
