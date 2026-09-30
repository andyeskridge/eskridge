import type { APIRoute } from "astro";
import { getEmDashCollection, getSiteSettings } from "emdash";
import { escapeXml, publicOrigin } from "../lib/site";

export const GET: APIRoute = async () => {
  const [settings, posts] = await Promise.all([
    getSiteSettings(),
    getEmDashCollection("posts", {
      status: "published",
      orderBy: { published_at: "desc" },
      limit: 50,
    }),
  ]);
  if (posts.error)
    return new Response("Feed temporarily unavailable", { status: 503 });
  const origin = publicOrigin();
  const items = posts.entries
    .filter((post) => post.data.publishedAt)
    .map((post) => {
      const link = `${origin}/writing/${encodeURIComponent(post.id)}`;
      return `<item><title>${escapeXml(post.data.title)}</title><link>${escapeXml(link)}</link><guid isPermaLink="true">${escapeXml(link)}</guid><pubDate>${post.data.publishedAt?.toUTCString()}</pubDate><description>${escapeXml(post.data.excerpt || "")}</description></item>`;
    })
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escapeXml(settings.title || "Andy Eskridge")}</title><link>${escapeXml(origin)}</link><description>${escapeXml(settings.tagline || "Software leadership. Practical curiosity.")}</description><language>en-us</language><atom:link href="${escapeXml(origin)}/feed.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`,
    {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    },
  );
};
