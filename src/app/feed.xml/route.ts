import { load } from 'cheerio';
import { Feed } from 'feed';

import { getAllArticles } from '@/lib/get-all-articles';

export async function GET(req: Request) {
  const siteUrl =
    process.env.CF_PAGES_BRANCH === 'main'
      ? 'https://eskridge.dev'
      : (process.env.CF_PAGES_URL ?? 'https://localhost:3000');
  const author = {
    name: 'Andy Eskridge',
    email: 'andy@eskridge.dev',
  };

  const feed = new Feed({
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
  });

  const articles = await getAllArticles();

  await Promise.all(
    articles.map(async (article) => {
      try {
        const url = String(
          new URL(`/articles/${article._sys.filename}`, req.url)
        );
        const response = await fetch(url);

        if (!response.ok) {
          return;
        }

        const html = await response.text();
        const $ = load(html);

        const publicUrl = `${siteUrl}/articles/${article._sys.filename}`;
        const articleDom = $('article').first();
        const title = article.title;
        const date = article.date;
        const content =
          articleDom.find('[data-mdx-content]').first().html() ?? '';

        feed.addItem({
          title,
          id: publicUrl,
          link: publicUrl,
          content,
          author: [author],
          contributor: [author],
          date: new Date(date),
        });
      } catch (_error) {
        // Continue processing other articles even if one fails
      }
    })
  );

  return new Response(feed.rss2(), {
    status: 200,
    headers: {
      'content-type': 'application/xml',
      'cache-control': 's-maxage=31556952',
    },
  });
}
