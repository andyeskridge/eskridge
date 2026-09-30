import { expect, test } from "bun:test";
import {
  type CmsRequest,
  commentSettings,
  configureNativeCms,
  legacyRedirects,
} from "../scripts/native-cms";

function fixture(conflict = false) {
  const collections = new Map(
    Object.keys(commentSettings).map((slug) => [
      slug,
      { commentsEnabled: false },
    ]),
  );
  const rules = [
    {
      id: "owner-rule",
      source: conflict ? "/uses" : "/owner-path",
      destination: "/about",
      type: 301,
      enabled: true,
    },
  ];
  let mutations = 0;
  const request: CmsRequest = async (path, method = "GET", data) => {
    if (method !== "GET") mutations++;
    if (path.startsWith("schema/collections/")) {
      const slug = path.split("/").at(-1) || "";
      if (method === "PUT")
        collections.set(slug, data as { commentsEnabled: boolean });
      return { item: collections.get(slug) };
    }
    if (method === "POST")
      rules.push({
        id: `rule-${rules.length}`,
        ...(data as Omit<(typeof rules)[number], "id">),
      });
    return { items: rules };
  };
  return { request, rules, mutations: () => mutations };
}

test("native configuration checks are read-only and migration is idempotent", async () => {
  const cms = fixture();
  expect(
    await configureNativeCms(cms.request).catch(
      (error: Error) => error.message,
    ),
  ).toContain("--apply");
  expect(cms.mutations()).toBe(0);
  await configureNativeCms(cms.request, true);
  expect(cms.rules[0]?.source).toBe("/owner-path");
  expect(cms.rules.length).toBe(legacyRedirects.length + 1);
  const writes = cms.mutations();
  expect((await configureNativeCms(cms.request, true)).updated).toBe(0);
  expect(cms.mutations()).toBe(writes);
});

test("a conflicting owner redirect stops the migration before any write", async () => {
  const cms = fixture(true);
  expect(
    await configureNativeCms(cms.request, true).catch(
      (error: Error) => error.message,
    ),
  ).toContain("/uses");
  expect(cms.mutations()).toBe(0);
  expect(cms.rules[0]?.destination).toBe("/about");
});
