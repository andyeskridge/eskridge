import type { MigrationReport } from "emdash/migrations";
import type { Environment, Resources } from "./cloudflare";

// Owner explicitly accepted this upgrade without a backup on 2026-10-01.
// Remove after PR #1903 deploys. This is not a reusable skip-backup switch.
export function allowsUpgrade1903WithoutBackup(input: {
  target: Environment;
  resources: Resources;
  report: MigrationReport;
  parentCommit: string;
  lockSha256: string;
  event: string | undefined;
  repository: string | undefined;
  now?: number;
}): boolean {
  const now = input.now ?? Date.now();
  return (
    now >= Date.parse("2026-10-01T21:00:00Z") &&
    now < Date.parse("2026-10-02T21:00:00Z") &&
    input.target === "production" &&
    input.event === "push" &&
    input.repository === "andyeskridge/eskridge" &&
    input.parentCommit === "38a174beb2985642dccb55ab9a3eaa10e4d09667" &&
    input.lockSha256 ===
      "7f920404499bfc800272720bbf1e834f8cbdf28532fa7a7a78faef6d25cf6f2a" &&
    input.resources.accountId === "4d0ec73da1296e7dcc788788effc7d43" &&
    input.resources.worker === "eskridge-emdash-production" &&
    input.resources.databaseId === "4d681934-7cfa-46fc-81e4-929566b760f1" &&
    input.resources.targetFingerprint ===
      "cb371b13a9aab5e204a2590edc55116b73721dab89c5d37d7c371cb17e4be767" &&
    input.report.unknownApplied.length === 0 &&
    !input.report.lock &&
    input.report.knownApplied.length === 88 &&
    input.report.knownApplied.includes("089_auto_seed_completion") &&
    JSON.stringify(input.report.pending) ===
      JSON.stringify([
        "090_redirect_enable_loop_guard",
        "091_redirect_artifacts",
      ])
  );
}
