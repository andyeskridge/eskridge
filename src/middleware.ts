import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import type { APIContext, MiddlewareNext } from "astro";
import { getCollectionInfo } from "emdash";
import { isAllowedAgentMessage, isDraftWrite } from "./lib/security";
import { isPublicSite, siteEnvironment } from "./lib/site";

async function handleRequest(
  context: APIContext,
  next: MiddlewareNext,
): Promise<Response> {
  const path = context.url.pathname.replace(/\/$/, "") || "/";
  const settings = env as unknown as Record<string, string>;
  const scopes = (context.locals as App.Locals & { tokenScopes?: string[] })
    .tokenScopes;
  if (
    scopes &&
    !scopes.includes("admin") &&
    !["GET", "HEAD", "OPTIONS"].includes(context.request.method)
  ) {
    const forbidden = () =>
      Response.json(
        {
          error: {
            message:
              "Agent access permits drafting and media work only. Review and publish through the CMS.",
          },
        },
        { status: 403 },
      );
    let body: unknown;
    if (path === "/_emdash/api/mcp") {
      try {
        body = await context.request.clone().json();
      } catch {
        return forbidden();
      }
      if (!isAllowedAgentMessage(body)) return forbidden();
    } else if (
      /^\/_emdash\/api\/content\/[^/]+(\/[^/]+)?$/.test(path) &&
      ["POST", "PUT"].includes(context.request.method)
    ) {
      try {
        body = await context.request.clone().json();
      } catch {
        return forbidden();
      }
      const creating =
        context.request.method === "POST" &&
        /^\/_emdash\/api\/content\/[^/]+$/.test(path);
      if (!isDraftWrite(body, creating)) return forbidden();
    } else if (
      !(
        (context.request.method === "POST" &&
          /^\/_emdash\/api\/content\/[^/]+\/[^/]+\/preview-url$/.test(path)) ||
        (path === "/_emdash/api/media" && context.request.method === "POST") ||
        (/^\/_emdash\/api\/media\/[^/]+$/.test(path) &&
          context.request.method === "PUT")
      )
    )
      return forbidden();
  }
  if (
    settings.SITE_READ_ONLY === "1" &&
    !["GET", "HEAD", "OPTIONS"].includes(context.request.method)
  )
    return new Response("Publishing and comments are paused for maintenance.", {
      status: 503,
      headers: { "Retry-After": "600", "Cache-Control": "no-store" },
    });
  // Deployed setup is available only to the owner carrying the bootstrap secret.
  if (
    siteEnvironment() !== "development" &&
    (path === "/_emdash/admin/setup" ||
      (context.request.method === "POST" &&
        /^\/_emdash\/api\/setup(\/|$)/.test(path)))
  ) {
    const secret = settings.SETUP_ACCESS_TOKEN;
    const supplied = context.url.searchParams.get("setup_token");
    if (secret && supplied === secret) {
      context.cookies.set("owner_setup", secret, {
        path: "/_emdash/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1800,
      });
      context.url.searchParams.delete("setup_token");
      return context.redirect(context.url.pathname + context.url.search, 303);
    }
    if (!secret || context.cookies.get("owner_setup")?.value !== secret)
      return new Response("Owner setup access required.", {
        status: 403,
        headers: { "Cache-Control": "private, no-store" },
      });
  }
  if (
    context.request.method === "POST" &&
    /^\/_emdash\/api\/comments\//.test(path)
  ) {
    // Save native moderation settings before accepting comments on a fresh
    // installation. The built-in moderator owns the approval decision.
    const collection = await getCollectionInfo("posts");
    if (
      collection?.commentsModeration !== "all" ||
      collection.commentsAutoApproveUsers
    )
      return Response.json(
        { error: { message: "Comments are temporarily unavailable." } },
        { status: 503 },
      );
    if (!/^\/_emdash\/api\/comments\/posts\/[^/]+$/.test(path))
      return new Response("Not found", { status: 404 });
    if (siteEnvironment() !== "development") {
      // Match native EmDash's runtime-only secret resolution. Native submission
      // verifies the single-use token; middleware must never consume it first.
      const secret =
        process.env.EMDASH_TURNSTILE_SECRET_KEY ||
        process.env.TURNSTILE_SECRET_KEY;
      if (!secret || !settings.TURNSTILE_SITE_KEY)
        return Response.json(
          { error: { message: "Comments are temporarily unavailable." } },
          { status: 503 },
        );
    }
  }
  // EmDash 1.2.0 skips file extensions in redirect middleware. Keep this one
  // retired file until native terminal rules also handle file URLs.
  if (path === "/AndyEskridgeResume.pdf") return context.rewrite("/gone");
  return next();
}

// Apply headers after every route, including early denials and redirects.
// Layout components cannot reliably set response headers once rendering starts.
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await handleRequest(context, next);
  const path = context.url.pathname.replace(/\/$/, "") || "/";
  const preview =
    context.url.searchParams.has("_preview") ||
    context.url.searchParams.has("_edit");
  const privateRoute =
    path === "/search" || path === "/admin" || path.startsWith("/_emdash/");
  if (
    !isPublicSite(context.url) ||
    privateRoute ||
    preview ||
    response.status >= 400
  )
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  if (
    preview ||
    path.startsWith("/_emdash/admin") ||
    path.startsWith("/_emdash/api")
  )
    response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
});
