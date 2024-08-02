import * as cheerio from 'cheerio'
import { Feed } from 'feed'

import { getAllArticles } from '@/lib/getAllArticles'

export const runtime = 'edge'

export async function GET(req: Request) {
  let siteUrl =
    process.env.CF_PAGES_BRANCH == 'main'
      ? 'https://eskridge.dev'
      : (process.env.CF_PAGES_URL ?? 'https://localhost:3000')
  let author = {
    name: 'Andy Eskridge',
    email: 'andy@eskridge.dev',
  }

  let feed = new Feed({
    title: author.name,
    description:
      'eskridge.dev is a small portfolio site written by Andy Eskridge',
    author,
    id: siteUrl,
    link: siteUrl,
    image: `${siteUrl}/favicon.ico`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    feedLinks: {
      rss2: `${siteUrl}/feed.xml`,
    },
  })

  let articles = await getAllArticles()

  for (let article of articles) {
    let url = String(new URL(`/articles/${article._sys.filename}`, req.url))
    let html = await (await fetch(url)).text()
    let $ = cheerio.load(html)

    let publicUrl = `${siteUrl}/articles/${article._sys.filename}`
    let articleDom = $('article').first()
    let title = article.title
    let date = article.date
    let content =
      articleDom.find('[data-mdx-content]').first().html() ?? undefined

    feed.addItem({
      title,
      id: publicUrl,
      link: publicUrl,
      content,
      author: [author],
      contributor: [author],
      date: new Date(date),
    })
  }

  return new Response(feed.rss2(), {
    status: 200,
    headers: {
      'content-type': 'application/xml',
      'cache-control': 's-maxage=31556952',
    },
  })
}
