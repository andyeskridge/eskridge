export interface ChallengeResult {
  success?: boolean;
  hostname?: string;
  action?: string;
}

const agentTools = new Set([
  "content_list",
  "content_get",
  "content_create",
  "content_update",
  "content_get_preview_url",
  "schema_list_collections",
  "schema_get_collection",
  "media_list",
  "media_get",
  "media_upload",
  "media_update",
]);
export function isDraftWrite(body: unknown, creating = false): boolean {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  const values = body as Record<string, unknown>;
  return (
    // On an existing item, even "draft" is a publication action: it unpublishes.
    (values.status === undefined || (creating && values.status === "draft")) &&
    values.publishedAt === undefined &&
    values.createdAt === undefined &&
    values.scheduledAt === undefined
  );
}
export function isAllowedAgentMessage(body: unknown): boolean {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  const message = body as {
    method?: string;
    params?: { name?: string; arguments?: unknown };
  };
  if (message.method !== "tools/call")
    return [
      "initialize",
      "notifications/initialized",
      "tools/list",
      "ping",
    ].includes(message.method || "");
  return (
    !!message.params?.name &&
    agentTools.has(message.params.name) &&
    isDraftWrite(
      message.params.arguments || {},
      message.params.name === "content_create",
    )
  );
}

export async function verifyCommentChallenge(
  token: unknown,
  secret: string,
  hostname: string,
  fetcher: (input: string, init: RequestInit) => Promise<Response> = fetch,
): Promise<boolean> {
  if (typeof token !== "string" || !token || !secret) return false;
  try {
    const response = await fetcher(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, response: token }),
        signal: AbortSignal.timeout(10000),
      },
    );
    const result = (await response.json()) as ChallengeResult;
    return (
      response.ok &&
      result.success === true &&
      result.hostname === hostname &&
      result.action === "comment"
    );
  } catch {
    return false;
  }
}
