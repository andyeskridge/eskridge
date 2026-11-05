import type { Resources } from "./cloudflare";

/** Fail closed before applying migrations to an existing database. */
export function validateRecoveryManifest(
  value: unknown,
  resources: Resources,
  now = Date.now(),
): void {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Recovery backup manifest must be an object.");
  const backup = value as Record<string, unknown>;
  const createdAt =
    typeof backup.createdAt === "string" ? Date.parse(backup.createdAt) : NaN;
  const matches = (
    [
      "accountId",
      "worker",
      "databaseId",
      "mediaBucket",
      "targetFingerprint",
    ] as const
  ).every((key) => backup[key] === resources[key]);
  if (
    !matches ||
    backup.complete !== true ||
    backup.keyEscrowVerified !== true ||
    !Number.isFinite(createdAt) ||
    createdAt > now ||
    now - createdAt > 86400000 ||
    typeof backup.appCommit !== "string" ||
    !/^[a-f0-9]{40}$/.test(backup.appCommit) ||
    typeof backup.lockSha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(backup.lockSha256) ||
    typeof backup.sqlSha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(backup.sqlSha256) ||
    !Array.isArray(backup.media)
  )
    throw new Error(
      "Recovery backup is incomplete, stale, or targets a different environment.",
    );
}
