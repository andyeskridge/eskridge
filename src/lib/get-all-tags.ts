import client from '@/tina/__generated__/client';
import type { Tag } from '@/tina/__generated__/types';

export async function getAllTags(): Promise<Tag[]> {
  const tagsRes = await client.queries.tagConnection({
    sort: 'name',
  });
  const tags = (tagsRes.data.tagConnection.edges || []).map((edge) => {
    return edge?.node;
  });
  return tags as Tag[];
}