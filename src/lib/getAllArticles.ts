import glob from 'fast-glob'
import * as path from 'path'
import { ReactElement, ReactNode } from 'react'

async function importArticle(articleFilename: string): Promise<{
  slug: string
  component: ReactElement
  author: string
  date: string
  title: string
  description: string
}> {
  let {
    meta,
    default: component,
  }: {
    meta: { author: string; date: string; title: string; description: string }
    default: ReactElement
  } = await import(`../pages/articles/${articleFilename}`)
  return {
    slug: articleFilename.replace(/(\/index)?\.mdx$/, ''),
    ...meta,
    component,
  }
}

export async function getAllArticles() {
  let articleFilenames = await glob(['*.mdx', '*/index.mdx'], {
    cwd: path.join(process.cwd(), 'src/pages/articles'),
  })

  let articles = await Promise.all(articleFilenames.map(importArticle))

  return articles.sort(
    (a, z) => new Date(z.date).valueOf() - new Date(a.date).valueOf()
  )
}
