import { describe, expect, test } from "bun:test";
import { validateSeed } from "emdash/seed";
import seed from "../seed/seed.json";

describe("launch safeguards", () => {
  test("seed is valid and contains only drafts", () => {
    expect(validateSeed(seed).valid).toBe(true);
    for (const entries of Object.values(seed.content))
      for (const entry of entries) expect(entry.status).toBe("draft");
  });
});
