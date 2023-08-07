import { getArticleIds } from '@/lib/getArticleIds'

export const runtime = 'edge'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

function addPage(page: string) {
  return `  <url>
    <loc>${`${siteUrl}${page}`}</loc>
    <changefreq>hourly</changefreq>
  </url>`
}

export function generateSitemap(articles: string[]) {
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
  </urlset>`

  return sitemap
}

export async function GET(req: Request) {
  let articleIds = getArticleIds()

  return new Response(generateSitemap(articleIds), {
    status: 200,
    headers: {
      'content-type': 'application/xml',
      'cache-control': 's-maxage=31556952',
    },
  })
}
