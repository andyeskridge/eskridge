import { env } from "cloudflare:workers";
import type { AstroGlobal } from "astro";

export function siteEnvironment(): string {
  return (
    (env as unknown as Record<string, string>).SITE_ENV ||
    (import.meta.env.DEV ? "development" : "unconfigured")
  );
}

export function publicOrigin(): string {
  return (
    (env as unknown as Record<string, string>).SITE_URL ||
    "https://eskridge.dev"
  );
}

export function registerHints(
  astro: AstroGlobal,
  ...results: { cacheHint?: unknown }[]
) {
  if (astro.cache?.enabled) {
    for (const result of results) {
      if (result.cacheHint)
        astro.cache.set(
          result.cacheHint as Parameters<typeof astro.cache.set>[0],
        );
    }
  }
}

export function formatDate(
  value: Date | string,
  timezone = "America/Chicago",
): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: timezone,
  }).format(new Date(value));
}

export function safeHref(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\"))
    return value;
  try {
    const url = new URL(value);
    if (["https:", "http:", "mailto:"].includes(url.protocol)) return value;
  } catch {
    /* Invalid editor-supplied link: omit it. */
  }
  return undefined;
}

export function escapeXml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character] as string,
  );
}

export function canonicalPath(pathname: string): string {
  return pathname === "/" ? "/" : pathname.replace(/\/$/, "");
}
