import { allArticles } from 'contentlayer/generated'

export async function getAllArticles() {
  return allArticles.sort(
    (a, z) => new Date(z.date).valueOf() - new Date(a.date).valueOf()
  )
}
