import resources from "../deployment/resources.json";
import { configureNativeCms } from "./native-cms";

const url = new URL(process.argv[2] || "http://127.0.0.1:4321");
const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
if (
  url.pathname !== "/" ||
  url.search ||
  url.hash ||
  url.username ||
  url.password ||
  (!local &&
    !Object.values(resources).some((item) => item.siteUrl === url.origin))
)
  throw new Error(
    "Choose the local CMS or a pinned staging/production origin.",
  );
let token = process.env.EMDASH_TOKEN;
if (!token && local) {
  const response = await fetch(
    `${url.origin}/_emdash/api/setup/dev-bypass?token=1`,
  );
  if (!response.ok) throw new Error("Start the local development CMS first.");
  token = ((await response.json()) as { data: { token: string } }).data.token;
}
if (!token)
  throw new Error("Set EMDASH_TOKEN to a temporary native admin credential.");
const request = async (path: string, method = "GET", data?: unknown) => {
  const response = await fetch(`${url.origin}/_emdash/api/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EmDash-Request": "1",
      "Content-Type": "application/json",
    },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok)
    throw new Error(
      `Native CMS ${method} ${path} failed (${response.status}).`,
    );
  return ((await response.json()) as { data: unknown }).data;
};
const result = await configureNativeCms(
  request,
  process.argv.includes("--apply"),
);
// Re-read native state rather than trusting a successful write response.
await configureNativeCms(request);
console.log(
  `Native moderation and legacy redirects verified (${result.updated} updates).`,
);
