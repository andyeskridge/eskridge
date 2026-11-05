import { expect, test } from "bun:test";
import { isAllowedAgentMessage, isDraftWrite } from "../src/lib/security";

test("agents can draft but cannot publish, delete, schedule or alter schemas", () => {
  for (const name of [
    "content_create",
    "content_update",
    "media_upload",
    "schema_get_collection",
  ])
    expect(
      isAllowedAgentMessage({
        method: "tools/call",
        params: { name, arguments: { data: { title: "Draft" } } },
      }),
    ).toBe(true);
  for (const name of [
    "content_publish",
    "content_delete",
    "content_schedule",
    "content_unpublish",
    "schema_create_collection",
    "media_delete",
    "site_import_resume",
  ])
    expect(
      isAllowedAgentMessage({
        method: "tools/call",
        params: { name, arguments: {} },
      }),
    ).toBe(false);
  expect(
    isAllowedAgentMessage([
      { method: "tools/call", params: { name: "content_publish" } },
    ]),
  ).toBe(false);
  expect(isDraftWrite({ status: "published" })).toBe(false);
  expect(isDraftWrite({ status: "draft" })).toBe(false);
  expect(isDraftWrite({ status: "draft" }, true)).toBe(true);
  expect(isDraftWrite({ status: "published" }, true)).toBe(false);
  expect(isDraftWrite({ publishedAt: "2026-09-29T00:00:00Z" })).toBe(false);
  expect(
    isAllowedAgentMessage({
      method: "tools/call",
      params: { name: "content_update", arguments: { status: "draft" } },
    }),
  ).toBe(false);
  expect(
    isAllowedAgentMessage({
      method: "tools/call",
      params: { name: "content_create", arguments: { status: "draft" } },
    }),
  ).toBe(true);
});
