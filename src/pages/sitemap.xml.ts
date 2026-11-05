import type { APIRoute } from "astro";
import { getEmDashCollection, getSeoMeta, getTaxonomyTerms } from "emdash";
import { escapeXml, isPublicSite, publicOrigin } from "../lib/site";

export const GET: APIRoute = async ({ url }) => {
  if (!isPublicSite(url))
    return new Response("Not available in this environment", { status: 404 });
  const paths = ["/", "/about", "/writing", "/projects", "/privacy"];
  for (const collection of ["posts", "projects"] as const) {
    let cursor: string | undefined;
    do {
      const result = await getEmDashCollection(collection, {
        status: "published",
        limit: 100,
        cursor,
      });
      if (result.error)
        return new Response("Sitemap temporarily unavailable", { status: 503 });
      paths.push(
        ...result.entries
          .filter((entry) => !getSeoMeta(entry).robots)
          .map(
            (entry) =>
              `/${collection === "posts" ? "writing" : "projects"}/${encodeURIComponent(entry.id)}`,
          ),
      );
      cursor = result.nextCursor;
    } while (cursor);
  }
  const terms = await getTaxonomyTerms("topic");
  paths.push(
    ...terms.map((term) => `/topics/${encodeURIComponent(term.slug)}`),
  );
  const urls = paths
    .map(
      (path) =>
        `<url><loc>${escapeXml(new URL(path, publicOrigin()).href)}</loc></url>`,
    )
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    },
  );
};
