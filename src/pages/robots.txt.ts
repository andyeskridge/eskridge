import type { APIRoute } from "astro";
import { isPublicSite, publicOrigin } from "../lib/site";
export const GET: APIRoute = ({ url }) =>
  new Response(
    isPublicSite(url)
      ? `User-agent: *\nAllow: /\nDisallow: /_emdash/\nDisallow: /search\nSitemap: ${publicOrigin()}/sitemap.xml\n`
      : "User-agent: *\nDisallow: /\n",
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
