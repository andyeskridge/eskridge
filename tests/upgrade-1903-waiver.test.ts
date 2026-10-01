import { expect, test } from "bun:test";
import type { MigrationReport } from "emdash/migrations";
import resources from "../deployment/resources.json";
import { allowsUpgrade1903WithoutBackup } from "../scripts/upgrade-1903-waiver";

test("the owner's backup waiver only permits the exact production upgrade", () => {
  const input: Parameters<typeof allowsUpgrade1903WithoutBackup>[0] = {
    target: "production",
    resources: resources.production,
    report: {
      target: {
        kind: "d1",
        label: "production",
        fingerprint: resources.production.targetFingerprint,
      },
      knownApplied: [
        ...Array.from({ length: 87 }, (_, i) => String(i)),
        "089_auto_seed_completion",
      ],
      pending: ["090_redirect_enable_loop_guard", "091_redirect_artifacts"],
      unknownApplied: [],
      executed: [],
    } satisfies MigrationReport,
    parentCommit: "38a174beb2985642dccb55ab9a3eaa10e4d09667",
    lockSha256:
      "7f920404499bfc800272720bbf1e834f8cbdf28532fa7a7a78faef6d25cf6f2a",
    event: "push",
    repository: "andyeskridge/eskridge",
    now: Date.parse("2026-10-01T22:00:00Z"),
  };
  expect(allowsUpgrade1903WithoutBackup(input)).toBe(true);
  for (const change of [
    { target: "staging" as const },
    { resources: resources.staging },
    { parentCommit: "a".repeat(40) },
    { lockSha256: "b".repeat(64) },
    { event: "workflow_dispatch" },
    { repository: "someone/eskridge" },
    { now: Date.parse("2026-10-01T20:59:59Z") },
    { now: Date.parse("2026-10-02T21:00:00Z") },
    { report: { ...input.report, pending: ["091_redirect_artifacts"] } },
    {
      report: {
        ...input.report,
        pending: [...input.report.pending, "092_future"],
      },
    },
    { report: { ...input.report, knownApplied: [] } },
    { report: { ...input.report, unknownApplied: ["unknown"] } },
    { report: { ...input.report, lock: { id: "held", heldSince: "now" } } },
  ])
    expect(allowsUpgrade1903WithoutBackup({ ...input, ...change })).toBe(false);
});
