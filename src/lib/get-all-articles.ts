import client from "@/tina/__generated__/client";
import type { Post } from "@/tina/__generated__/types";

export async function getAllArticles(): Promise<Post[]> {
  const articlesRes = await client.queries.postConnection({
    sort: "date",
  });
  const articles =
    articlesRes.data.postConnection.edges?.map((edge) => edge?.node) ?? [];
  const validArticles = articles.filter(Boolean) as Post[];
  return validArticles.filter((article) => article.draft !== true);
}
