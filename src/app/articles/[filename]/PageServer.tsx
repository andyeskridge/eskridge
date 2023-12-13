import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { ArticleLayout } from '@/components/ArticleLayout'

export default function PageServer({ data }: { data: any }) {
  return (
    <ArticleLayout article={data.post} isRssFeed={false}>
      <h1>{data.post.title}</h1>
      <TinaMarkdown content={data.post.body} />
    </ArticleLayout>
  )
}
