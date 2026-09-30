// Installation/configuration data, consumed through EmDash's public REST API.
// This is never reapplied as a seed or on public requests.
export const commentSettings = {
  posts: {
    commentsEnabled: true,
    commentsModeration: "all",
    commentsAutoApproveUsers: false,
  },
  projects: { commentsEnabled: false },
  pages: { commentsEnabled: false },
};

export const legacyRedirects = [
  { source: "/articles", destination: "/writing", type: 301 },
  { source: "/home", destination: "/", type: 302 },
  { source: "/admin", destination: "/_emdash/admin/", type: 302 },
  ...[
    "/speaking",
    "/uses",
    "/thank-you",
    "/articles/Another-new-post",
    "/articles/Test-Post",
    "/articles/hello-world",
    "/categories",
    "/categories/[...path]",
    "/tags",
    "/tags/[...path]",
  ].map((source) => ({ source, destination: "", type: 410 })),
];

export type CmsRequest = (
  path: string,
  method?: string,
  data?: unknown,
) => Promise<unknown>;
interface Redirect {
  id: string;
  source: string;
  destination: string;
  type: number;
  enabled: boolean;
}

export async function configureNativeCms(request: CmsRequest, apply = false) {
  const writes: { path: string; method: string; data: unknown }[] = [];
  for (const [slug, expected] of Object.entries(commentSettings)) {
    const { item } = (await request(`schema/collections/${slug}`)) as {
      item: Record<string, unknown>;
    };
    if (Object.entries(expected).some(([key, value]) => item[key] !== value))
      writes.push({
        path: `schema/collections/${slug}`,
        method: "PUT",
        data: expected,
      });
  }
  const rules: Redirect[] = [];
  let cursor: string | undefined;
  do {
    const page = (await request(
      `redirects?limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`,
    )) as { items: Redirect[]; nextCursor?: string };
    rules.push(...page.items);
    cursor = page.nextCursor;
  } while (cursor);
  for (const rule of legacyRedirects) {
    const existing = rules.filter((item) => item.source === rule.source);
    // Do not overwrite an owner's existing rule. All reads/preflight happen
    // before writes, so a conflict also leaves moderation settings unchanged.
    if (
      existing.length > 1 ||
      existing.some(
        (item) =>
          !item.enabled ||
          item.destination !== rule.destination ||
          item.type !== rule.type,
      )
    )
      throw new Error(
        `Existing redirect conflicts with migration: ${rule.source}`,
      );
    if (!existing.length)
      writes.push({
        path: "redirects",
        method: "POST",
        data: { ...rule, enabled: true, groupName: "Legacy site" },
      });
  }
  if (!apply && writes.length)
    throw new Error(
      `Native CMS configuration needs ${writes.length} updates. Run configure:cms with --apply.`,
    );
  for (const write of writes)
    await request(write.path, write.method, write.data);
  return { updated: writes.length };
}
