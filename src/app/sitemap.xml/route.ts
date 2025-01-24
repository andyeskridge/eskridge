import { getAllArticles } from '@/lib/get-all-articles';

const siteUrl =
  process.env.CF_PAGES_BRANCH === 'main'
    ? 'https://eskridge.dev'
    : (process.env.CF_PAGES_URL ?? 'https://localhost:3000');

function addPage(page: string) {
  return `  <url>
    <loc>${`${siteUrl}${page}`}</loc>
    <changefreq>hourly</changefreq>
  </url>`;
}

function generateSitemap(articles: string[]) {
  const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>${siteUrl}/about</loc>
      <changefreq>hourly</changefreq>
    </url>
    <url>
      <loc>${siteUrl}</loc>
      <changefreq>hourly</changefreq>
    </url>
    <url>
      <loc>${siteUrl}/thank-you</loc>
      <changefreq>hourly</changefreq>
    </url>
    <url>
      <loc>${siteUrl}/articles</loc>
      <changefreq>hourly</changefreq>
    </url>
    ${articles.map((article) => addPage(`/articles/${article}`)).join('')}
  </urlset>`;

  return sitemap;
}

export async function GET(_req: Request) {
  const articleIds = (await getAllArticles()).map(
    (article) => article._sys.filename
  );

  return new Response(generateSitemap(articleIds), {
    status: 200,
    headers: {
      'content-type': 'application/xml',
      'cache-control': 's-maxage=31556952',
    },
  });
}
