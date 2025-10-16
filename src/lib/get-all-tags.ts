import client from "@/tina/__generated__/client";
import type { Tag } from "@/tina/__generated__/types";

export async function getAllTags(): Promise<Tag[]> {
  const tagsRes = await client.queries.tagConnection({
    sort: "name",
  });
  const tags =
    tagsRes.data.tagConnection.edges?.map((edge) => edge?.node) ?? [];
  return tags.filter(Boolean) as Tag[];
}
