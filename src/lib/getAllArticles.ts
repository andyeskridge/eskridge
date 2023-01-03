import { allArticles } from 'contentlayer/generated'

export function getAllArticles() {
  return allArticles.sort(
    (a, z) => new Date(z.date).valueOf() - new Date(a.date).valueOf()
  )
}
