import client from '@/tina/__generated__/client';
import type { Category } from '@/tina/__generated__/types';

export async function getAllCategories(): Promise<Category[]> {
  const categoriesRes = await client.queries.categoryConnection({
    sort: 'name',
  });
  const categories = (categoriesRes.data.categoryConnection.edges || []).map(
    (edge) => {
      return edge?.node;
    }
  );
  return categories as Category[];
}
