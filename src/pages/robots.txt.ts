import type { APIRoute } from "astro";
import { publicOrigin, siteEnvironment } from "../lib/site";
export const GET: APIRoute = () =>
  new Response(
    siteEnvironment() === "production"
      ? `User-agent: *\nAllow: /\nDisallow: /_emdash/\nDisallow: /search\nSitemap: ${publicOrigin()}/sitemap.xml\n`
      : "User-agent: *\nDisallow: /\n",
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
