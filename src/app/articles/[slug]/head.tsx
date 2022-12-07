import { getAllArticles } from '@/lib/getAllArticles'
import { type Article } from 'contentlayer/generated'
import { notFound } from 'next/navigation'

function getArticle(slug: string) {
  const post = getAllArticles().find(
    (post: Article) => post._raw.flattenedPath === slug
  )
  if (!post) {
    throw notFound()
  }
  return post
}

export default function Head({ params }: { params: { slug: string } }) {
  const post = getArticle(params.slug)
  return (
    <>
      <title>{`${post.title} - Andy Eskridge`}</title>
      <meta name="description" content={post.description} />
    </>
  )
}
