import { expect, test } from "bun:test";
import type { Resources } from "../scripts/cloudflare";
import { validateRecoveryManifest } from "../scripts/recovery-manifest";

test("migration backups require exact identities, completion, checksums and a valid recent date", () => {
  const resources: Resources = {
    accountId: "a".repeat(32),
    worker: "production",
    databaseId: "production-database",
    databaseName: "production",
    mediaBucket: "production-media",
    sessionNamespaceId: "production-sessions",
    siteUrl: "https://example.test",
    targetFingerprint: "b".repeat(64),
  };
  const now = Date.parse("2026-09-30T00:00:00Z");
  const backup = {
    ...resources,
    createdAt: new Date(now - 60000).toISOString(),
    complete: true,
    keyEscrowVerified: true,
    appCommit: "c".repeat(40),
    lockSha256: "d".repeat(64),
    sqlSha256: "e".repeat(64),
    media: [],
  };
  expect(() => validateRecoveryManifest(backup, resources, now)).not.toThrow();
  for (const change of [
    { createdAt: "not-a-date" },
    { createdAt: undefined },
    { createdAt: new Date(now + 60000).toISOString() },
    { createdAt: new Date(now - 86400001).toISOString() },
    { accountId: "another-account" },
    { worker: "staging" },
    { databaseId: "staging-database" },
    { mediaBucket: "staging-media" },
    { targetFingerprint: "f".repeat(64) },
    { complete: "true" },
    { keyEscrowVerified: false },
    { sqlSha256: "" },
    { lockSha256: undefined },
    { appCommit: "" },
    { media: undefined },
  ])
    expect(() =>
      validateRecoveryManifest({ ...backup, ...change }, resources, now),
    ).toThrow();
});
