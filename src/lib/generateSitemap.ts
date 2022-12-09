import { allArticles } from 'contentlayer/generated'

function addPage(page: string) {
  return `  <url>
    <loc>${`${process.env.NEXT_PUBLIC_SITE_URL}${page}`}</loc>
    <changefreq>hourly</changefreq>
  </url>`
}

export function generateSitemap() {
  const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>${process.env.NEXT_PUBLIC_SITE_URL}/about</loc>
      <changefreq>hourly</changefreq>
    </url>
    <url>
      <loc>${process.env.NEXT_PUBLIC_SITE_URL}</loc>
      <changefreq>hourly</changefreq>
    </url>
    <url>
      <loc>${process.env.NEXT_PUBLIC_SITE_URL}/thank-you</loc>
      <changefreq>hourly</changefreq>
    </url>
    <url>
      <loc>${process.env.NEXT_PUBLIC_SITE_URL}/articles</loc>
      <changefreq>hourly</changefreq>
    </url>
    ${allArticles.map((article) => addPage(article.url)).join('')}
  </urlset>`

  return sitemap
}
