import { fileURLToPath } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";

export default defineConfig({
  site: process.env.SITE_URL || "https://eskridge.dev",
  output: "server",
  adapter: cloudflare(),
  image: { layout: "constrained", responsiveStyles: true },
  integrations: [
    react(),
    emdash({
      siteUrl: process.env.SITE_URL || "https://eskridge.dev",
      database: d1({ binding: "DB", session: "auto" }),
      storage: r2({ binding: "MEDIA" }),
      migrations: { runtime: "check", dev: "auto" },
      mcp: true,
      plugins: [
        {
          id: "eskridge-comment-policy",
          version: "1.0.0",
          entrypoint: fileURLToPath(
            new URL("./src/plugins/comment-policy.mjs", import.meta.url),
          ).replaceAll("\\", "/"),
        },
      ],
    }),
  ],
  devToolbar: { enabled: false },
  vite: {
    cacheDir:
      process.argv.includes("check") || process.argv.includes("sync")
        ? "node_modules/.vite-check"
        : process.argv.includes("build")
          ? "node_modules/.vite-build"
          : "node_modules/.vite-dev",
    environments: {
      ssr: {
        optimizeDeps: { include: ["@astrojs/internal-helpers > picomatch"] },
      },
    },
  },
});
