import ReactDOMServer from 'react-dom/server'
import { Feed } from 'feed'

import { getAllArticles } from './getAllArticles'
import { useMDXComponent } from 'next-contentlayer/hooks'

export async function generateRssFeed() {
  let articles = await getAllArticles()
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  let author = {
    name: 'Andy Eskridge',
    email: 'andy@eskridge.dev',
  }

  let feed = new Feed({
    title: author.name,
    description: 'Your blog description',
    author,
    id: siteUrl,
    link: siteUrl,
    image: `${siteUrl}/favicon.ico`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    feedLinks: {
      rss2: `${siteUrl}/feed.xml`,
      json: `${siteUrl}/feed.json`,
    },
  })

  for (let article of articles) {
    let url = `${siteUrl}${article.url}`
    let html = article.body.raw

    feed.addItem({
      title: article.title,
      id: url,
      link: url,
      description: article.description,
      content: html,
      author: [author],
      contributor: [author],
      date: new Date(article.date),
    })
  }

  return feed
}
