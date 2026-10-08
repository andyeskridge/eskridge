import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { siteEnvironment } from "../lib/site";
export const GET: APIRoute = () =>
  Response.json(
    {
      environment: siteEnvironment(),
      readOnly:
        (env as unknown as Record<string, string>).SITE_READ_ONLY === "1",
      application: "emdash@1.2.0",
    },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
