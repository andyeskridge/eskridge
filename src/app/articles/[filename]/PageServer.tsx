import { TinaMarkdown } from 'tinacms/dist/rich-text'

import { ArticleLayout } from '@/components/ArticleLayout'

import { PostQuery } from '@/tina/__generated__/types'

export default function PageServer({ data }: { data: PostQuery }) {
  return (
    <ArticleLayout article={data.post} isRssFeed={false}>
      <TinaMarkdown content={data.post.body} />
    </ArticleLayout>
  )
}
