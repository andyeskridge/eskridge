import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { type APIRequestContext, expect, test } from "@playwright/test";

const block = (text: string) => [
  {
    _type: "block",
    _key: "paragraph",
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: "text", marks: [], text }],
  },
];
let token: string;
let admin: APIRequestContext;
const created: { collection: string; id: string }[] = [];
const uploadedMedia: string[] = [];
const baseURL = "http://127.0.0.1:4322";
const wrangler = fileURLToPath(
  new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url),
);
async function api(path: string, method = "GET", data?: unknown) {
  const response = await admin.fetch(`/_emdash/api/${path}`, {
    method,
    data,
    headers: { Authorization: `Bearer ${token}`, "X-EmDash-Request": "1" },
  });
  const result = await response.json();
  expect(response.ok(), JSON.stringify(result)).toBeTruthy();
  return result.data;
}
async function create(
  collection: string,
  slug: string,
  data: unknown,
  taxonomies?: unknown,
) {
  const result = await api(`content/${collection}`, "POST", {
    slug,
    data,
    taxonomies,
  });
  const item = result.item;
  created.push({ collection, id: item.id });
  return item;
}
test.beforeAll(async ({ playwright }) => {
  execFileSync(
    process.execPath,
    [
      wrangler,
      "d1",
      "execute",
      "DB",
      "--local",
      "--persist-to",
      ".wrangler/e2e",
      "--command",
      "DELETE FROM _emdash_rate_limits",
    ],
    { stdio: "pipe" },
  );
  admin = await playwright.request.newContext({
    baseURL,
  });
  const response = await admin.get("/_emdash/api/setup/dev-bypass?token=1");
  expect(response.ok()).toBeTruthy();
  token = (await response.json()).data.token;
});
test.beforeEach(() => {
  execFileSync(
    process.execPath,
    [
      wrangler,
      "d1",
      "execute",
      "DB",
      "--local",
      "--persist-to",
      ".wrangler/e2e",
      "--command",
      "DELETE FROM _emdash_rate_limits",
    ],
    { stdio: "pipe" },
  );
});
test.afterAll(async () => {
  for (const item of created)
    await api(`content/${item.collection}/${item.id}`, "DELETE");
  for (const id of uploadedMedia) await api(`media/${id}`, "DELETE");
  await admin.dispose();
});

test("CMS drafts, isolated previews, live publication, discovery and media", async ({
  page,
  request,
}) => {
  const suffix = `${Date.now()}`;
  const slug = `qa-${suffix}`;
  const title = `QA article ${suffix}`;
  const item = await create(
    "posts",
    slug,
    {
      title,
      excerpt: "Local test content",
      content: block("First public version"),
    },
    { topic: ["technology"] },
  );
  expect((await request.get(`/writing/${slug}`)).status()).toBe(404);
  expect(await (await request.get(`/search?q=${suffix}`)).text()).not.toContain(
    title,
  );
  expect(await (await request.get("/feed.xml")).text()).not.toContain(title);
  const preview = await api(`content/posts/${item.id}/preview-url`, "POST", {});
  const previewPath = new URL(preview.url, baseURL);
  await page.goto(previewPath.pathname + previewPath.search);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  await expect(page.locator("#comment-form")).toHaveCount(0);
  expect((await request.get(`/writing/${slug}`)).status()).toBe(404);
  const tampered = new URL(previewPath);
  const previewToken = tampered.searchParams.get("_preview");
  expect(previewToken).toBeTruthy();
  // Always change a meaningful character, rather than a possibly identical or
  // unused final base64 padding bit.
  tampered.searchParams.set(
    "_preview",
    `${previewToken?.[0] === "x" ? "y" : "x"}${previewToken?.slice(1)}`,
  );
  expect(
    (await request.get(tampered.pathname + tampered.search)).status(),
  ).toBe(404);
  await api(`content/posts/${item.id}/publish`, "POST", {});
  await page.goto(`/writing/${slug}`);
  await expect(page.getByText("First public version")).toBeVisible();
  await api(`content/posts/${item.id}`, "PUT", {
    data: {
      title,
      excerpt: "Local test content",
      content: block("Second public version"),
    },
  });
  expect(await (await request.get(`/writing/${slug}`)).text()).toContain(
    "First public version",
  );
  expect(await (await request.get(`/writing/${slug}`)).text()).not.toContain(
    "Second public version",
  );
  await api(`content/posts/${item.id}/publish`, "POST", {});
  await page.reload();
  await expect(page.getByText("Second public version")).toBeVisible();
  expect(await (await request.get(`/search?q=${suffix}`)).text()).toContain(
    title,
  );
  expect(await (await request.get("/topics/technology")).text()).toContain(
    title,
  );
  expect(await (await request.get("/feed.xml")).text()).toContain(title);
  const revision = await api(`content/posts/${item.id}/revisions`);
  expect(revision.items.length).toBeGreaterThan(0);
  const scheduled = await create("posts", `qa-scheduled-${suffix}`, {
    title: `Scheduled ${suffix}`,
    excerpt: "Scheduled fixture",
    content: block("Scheduled text"),
  });
  await api(`content/posts/${scheduled.id}/schedule`, "POST", {
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
  });
  expect((await request.get(`/writing/qa-scheduled-${suffix}`)).status()).toBe(
    404,
  );
  const uploaded = await admin.post("/_emdash/api/media", {
    headers: { Authorization: `Bearer ${token}`, "X-EmDash-Request": "1" },
    multipart: {
      file: {
        name: `qa-${suffix}.png`,
        mimeType: "image/png",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6dXkAAAAASUVORK5CYII=",
          "base64",
        ),
      },
    },
  });
  expect(uploaded.ok(), await uploaded.text()).toBeTruthy();
  const media = (await uploaded.json()).data.item;
  uploadedMedia.push(media.id);
  expect((await request.get(media.url)).ok()).toBeTruthy();
  await api(`content/posts/${item.id}`, "PUT", { seo: { noIndex: true } });
  await api(`content/posts/${item.id}/publish`, "POST", {});
  expect(
    (await request.get(`/writing/${slug}`)).headers()["x-robots-tag"],
  ).toContain("noindex");
});

test("comments need approval, keep email private, render safely and limit spam", async ({
  page,
  request,
}) => {
  const suffix = `${Date.now()}`;
  const slug = `qa-comments-${suffix}`;
  const item = await create("posts", slug, {
    title: "Local discussion test",
    excerpt: "Local test content",
    content: block("Article text"),
  });
  await api(`content/posts/${item.id}/publish`, "POST", {});
  await page.goto(`/writing/${slug}`);
  const email = `private-${suffix}@example.test`;
  const unsafe = '<img src=x onerror="window.unsafe=1">';
  await page.getByLabel("Display name", { exact: true }).fill("Local reader");
  await page.getByLabel("Email (kept private)").fill(email);
  await page.getByLabel("Your comment").fill(unsafe);
  await page.getByRole("button", { name: /Submit for review/ }).click();
  await expect(page.getByRole("status")).toContainText("review");
  await page.reload();
  await expect(page.locator(".comment-body")).toHaveCount(0);
  const pending = await api(
    `admin/comments?status=pending&collection=posts&contentId=${item.id}`,
  );
  const comment = pending.items.find(
    (entry: { authorEmail: string }) => entry.authorEmail === email,
  );
  expect(comment).toBeTruthy();
  await api(`admin/comments/${comment.id}/status`, "PUT", {
    status: "approved",
  });
  await page.reload();
  await expect(page.locator(".comment-body")).toHaveText(unsafe);
  await expect(page.locator(".comment-body img")).toHaveCount(0);
  expect(await page.content()).not.toContain(email);
  const publicComments = await (
    await request.get(`/_emdash/api/comments/posts/${item.id}`)
  ).text();
  expect(publicComments).not.toContain(email);
  expect(publicComments).not.toContain("authorEmail");
  const endpoint = `/_emdash/api/comments/posts/${item.id}`;
  const returning = await request.post(endpoint, {
    headers: { "X-EmDash-Request": "1" },
    data: {
      authorName: "Local reader",
      authorEmail: email,
      body: "Returning reader",
      parentId: comment.id,
    },
  });
  expect((await returning.json()).data.status).toBe("pending");
  const reply = (await returning.json()).data.id;
  await api(`admin/comments/${reply}/status`, "PUT", { status: "approved" });
  await page.reload();
  await expect(page.locator(".comment-replies .comment-body")).toHaveText(
    "Returning reader",
  );
  const authenticated = await admin.post(endpoint, {
    headers: { Authorization: `Bearer ${token}`, "X-EmDash-Request": "1" },
    data: { authorName: "Owner", authorEmail: email, body: "Owner reply" },
  });
  expect((await authenticated.json()).data.status).toBe("pending");
  const spam = await request.post(endpoint, {
    headers: { "X-EmDash-Request": "1" },
    data: {
      authorName: "Bot",
      authorEmail: email,
      body: "Hidden spam",
      website_url: "http://spam.test",
    },
  });
  expect((await spam.json()).data.status).toBe("pending");
  expect(await (await request.get(`/writing/${slug}`)).text()).not.toContain(
    "Hidden spam",
  );
  let limited = false;
  for (let index = 0; index < 22; index++) {
    const response = await request.post(endpoint, {
      headers: { "X-EmDash-Request": "1" },
      data: {
        authorName: "Rate test",
        authorEmail: email,
        body: `Rate ${index}`,
      },
    });
    if (response.status() === 429) {
      limited = true;
      expect(response.headers()["retry-after"]).toBeTruthy();
      break;
    }
  }
  expect(limited).toBeTruthy();
  expect(
    (
      await request.post("/_emdash/api/comments/projects/anything", {
        data: {},
      })
    ).status(),
  ).toBe(404);
});

test("archives, themes, accessibility and responsive navigation", async ({
  page,
  request,
}, testInfo) => {
  const suffix = `${Date.now()}`;
  for (let index = 0; index < 11; index++) {
    const item = await create("posts", `qa-archive-${suffix}-${index}`, {
      title: `Archive ${index}`,
      excerpt: "Archive test",
      content: block("Local archive text"),
    });
    await api(`content/posts/${item.id}/publish`, "POST", {});
  }
  await page.goto("/writing");
  await expect(page.locator(".post-card")).toHaveCount(10);
  await page.getByRole("link", { name: /Older/ }).click();
  await expect(page).toHaveURL(/cursor=/);
  await expect(page.locator(".post-card").first()).toBeVisible();
  await page.goto("/");
  await page.getByRole("button", { name: /Switch to dark/ }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  for (const theme of ["dark", "light"]) {
    if (theme === "light")
      await page.getByRole("button", { name: /Switch to light/ }).click();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    await page.screenshot({
      path: `output/playwright/${testInfo.project.name}-${theme}.png`,
      fullPage: true,
    });
  }
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect((await request.get("/articles", { maxRedirects: 0 })).status()).toBe(
    301,
  );
  expect((await request.get("/uses")).status()).toBe(410);
  expect((await request.get("/tags/obsolete")).status()).toBe(410);
  expect((await request.get("/does-not-exist")).status()).toBe(404);
  expect((await request.get("/writing")).headers()["x-robots-tag"]).toContain(
    "noindex",
  );
});

test("limited agent credentials cannot publish, unpublish, delete or change schemas", async ({
  request,
}) => {
  const credentials = await api("admin/api-tokens", "POST", {
    name: "Local draft-only QA",
    scopes: [
      "content:read",
      "content:write",
      "media:read",
      "media:write",
      "schema:read",
    ],
  });
  const headers = {
    Authorization: `Bearer ${credentials.token}`,
    "X-EmDash-Request": "1",
  };
  const createdResponse = await request.post("/_emdash/api/content/posts", {
    headers,
    data: {
      slug: `qa-agent-${Date.now()}`,
      data: { title: "Agent draft", excerpt: "Private agent fixture" },
    },
  });
  expect(createdResponse.ok(), await createdResponse.text()).toBeTruthy();
  const item = (await createdResponse.json()).data.item;
  created.push({ collection: "posts", id: item.id });
  expect(
    (
      await request.put(`/_emdash/api/content/posts/${item.id}`, {
        headers,
        data: { data: { title: "Edited agent draft" } },
      })
    ).ok(),
  ).toBeTruthy();
  expect(
    (
      await request.post(`/_emdash/api/content/posts/${item.id}/publish`, {
        headers,
        data: {},
      })
    ).status(),
  ).toBe(403);
  await api(`content/posts/${item.id}/publish`, "POST", {});
  expect(
    (
      await request.put(`/_emdash/api/content/posts/${item.id}`, {
        headers,
        data: { status: "draft" },
      })
    ).status(),
  ).toBe(403);
  expect((await request.get(`/writing/${item.slug}`)).status()).toBe(200);
  expect(
    (
      await request.delete(`/_emdash/api/content/posts/${item.id}`, { headers })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/_emdash/api/schema/collections", {
        headers,
        data: { slug: "unsafe" },
      })
    ).status(),
  ).toBe(403);
  const mcpHeaders = {
    ...headers,
    Accept: "application/json, text/event-stream",
  };
  expect(
    (
      await request.post("/_emdash/api/mcp", {
        headers: mcpHeaders,
        data: {
          jsonrpc: "2.0",
          id: 3,
          method: "tools/call",
          params: {
            name: "content_update",
            arguments: { collection: "posts", id: item.id, status: "draft" },
          },
        },
      })
    ).status(),
  ).toBe(403);
  expect((await request.get(`/writing/${item.slug}`)).status()).toBe(200);
  expect(
    (
      await request.post("/_emdash/api/mcp", {
        headers: mcpHeaders,
        data: {
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: {
            name: "content_publish",
            arguments: { collection: "posts", id: item.id },
          },
        },
      })
    ).status(),
  ).toBe(403);
  const allowed = await request.post("/_emdash/api/mcp", {
    headers: mcpHeaders,
    data: {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "content_get",
        arguments: { collection: "posts", id: item.id },
      },
    },
  });
  expect(allowed.ok(), await allowed.text()).toBeTruthy();
  expect(await allowed.text()).toContain("Edited agent draft");
  await api(`admin/api-tokens/${credentials.info.id}`, "DELETE");
});

test("CMS homepage selections preserve order and project filtering", async ({
  page,
  request,
}) => {
  const suffix = Date.now();
  const personal = await create(
    "projects",
    `qa-personal-${suffix}`,
    {
      title: `Personal ${suffix}`,
      summary: "Personal fixture",
      kind: "personal",
      role: "Test owner",
      context: block("Context"),
      approach: block("Approach"),
      outcomes: block("Outcome"),
    },
    { topic: ["technology"] },
  );
  const professional = await create("projects", `qa-professional-${suffix}`, {
    title: `Professional ${suffix}`,
    summary: "Professional fixture",
    kind: "professional",
  });
  await api(`content/projects/${personal.id}/publish`, "POST", {});
  await api(`content/projects/${professional.id}/publish`, "POST", {});
  const home = (await api("content/pages/home")).item;
  try {
    // Reproduce the 1.0.1 stale baseline bug after copying a live revision
    // back to draft; publication must replace the original seeded selection.
    await api(`content/pages/${home.id}/publish`, "POST", {});
    await api(`content/pages/${home.id}/unpublish`, "POST", {});
    await api(`content/pages/${home.id}`, "PUT", {
      references: { featured_projects: [personal.id, professional.id] },
    });
    await api(`content/pages/${home.id}/publish`, "POST", {});
    await page.goto("/");
    await expect(page.locator(".project-card h3")).toHaveText([
      `Personal ${suffix}`,
      `Professional ${suffix}`,
    ]);
    await api(`content/pages/${home.id}`, "PUT", {
      references: { featured_projects: [professional.id, personal.id] },
    });
    await page.reload();
    await expect(page.locator(".project-card h3")).toHaveText([
      `Personal ${suffix}`,
      `Professional ${suffix}`,
    ]);
    await api(`content/pages/${home.id}/publish`, "POST", {});
    await page.reload();
    await expect(page.locator(".project-card h3")).toHaveText([
      `Professional ${suffix}`,
      `Personal ${suffix}`,
    ]);
    await page.goto("/projects?kind=personal");
    await expect(
      page.getByRole("heading", { name: `Personal ${suffix}` }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: `Professional ${suffix}` }),
    ).toHaveCount(0);
    expect(await (await request.get("/topics/technology")).text()).toContain(
      `Personal ${suffix}`,
    );
    await page.goto(`/projects/qa-personal-${suffix}`);
    await expect(
      page.getByRole("heading", { name: "The approach" }),
    ).toBeVisible();
    await expect(page.locator("#comment-form")).toHaveCount(0);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  } finally {
    await api(`content/pages/${home.id}/unpublish`, "POST", {});
    // Reset selected references to the real draft project, without publishing it.
    const project = (await api("content/projects/a-more-maintainable-homelab"))
      .item;
    await api(`content/pages/${home.id}`, "PUT", {
      references: { featured_projects: [project.id] },
    });
  }
});
