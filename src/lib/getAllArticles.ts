import client from '@/tina/__generated__/client'
import { Post } from '@/tina/__generated__/types'

export async function getAllArticles(): Promise<Post[]> {
  let articlesRes = await client.queries.postConnection()
  const articles = (articlesRes.data.postConnection.edges || []).map((edge) => {
    return edge!.node
  })
  return articles as Post[]
}
