import { afterEach, expect, spyOn, test } from "bun:test";
import { readdir } from "node:fs/promises";
import * as source from "../node_modules/emdash/src/comments/turnstile";

// Exercise the package's shipped chunk as well as the patched source.
const chunks = (await readdir("node_modules/emdash/dist")).filter((name) =>
  /^turnstile-.*\.mjs$/.test(name),
);
if (chunks.length !== 1) throw new Error("Recheck the EmDash Turnstile patch.");
const runtime: typeof source = await import(
  new URL(`../node_modules/emdash/dist/${chunks[0]}`, import.meta.url).href
);
let fetchSpy: ReturnType<typeof spyOn<typeof globalThis, "fetch">> | undefined;
afterEach(() => fetchSpy?.mockRestore());

for (const [label, { verifyTurnstileToken }] of Object.entries({
  source,
  runtime,
})) {
  test(`${label}: verifies a token once and rejects reuse`, async () => {
    const used = new Set<string>();
    fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
      Object.assign(
        async (_: unknown, init?: { body?: unknown }) => {
          const body = JSON.parse(String(init?.body));
          expect(body.secret).toBe("test-secret");
          const success = !used.has(body.response);
          used.add(body.response);
          return Response.json({
            success,
            hostname: "example.test",
            action: "comment",
          });
        },
        { preconnect: globalThis.fetch.preconnect },
      ),
    );
    expect(
      await verifyTurnstileToken("one-use", "test-secret", "example.test"),
    ).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(
      await verifyTurnstileToken("one-use", "test-secret", "example.test"),
    ).toBe(false);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  test(`${label}: binds hostname/action and fails closed`, async () => {
    for (const [body, status] of [
      [{ success: true, hostname: "other.test", action: "comment" }, 200],
      [{ success: true, hostname: "example.test", action: "login" }, 200],
      [{ success: true, hostname: "example.test", action: "comment" }, 503],
      [{ success: false }, 200],
      [{ success: true }, 200],
      [null, 200],
    ] as const) {
      fetchSpy?.mockRestore();
      fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
        Response.json(body, { status }),
      );
      expect(
        await verifyTurnstileToken("token", "test-secret", "example.test"),
      ).toBe(false);
    }
    fetchSpy?.mockRestore();
    fetchSpy = spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("transport failure"),
    );
    expect(
      await verifyTurnstileToken("token", "test-secret", "example.test"),
    ).toBe(false);
    expect(
      await verifyTurnstileToken(undefined, "test-secret", "example.test"),
    ).toBe(false);
    expect(await verifyTurnstileToken("token", "", "example.test")).toBe(false);
    expect(await verifyTurnstileToken("token", "test-secret", "")).toBe(false);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
}
