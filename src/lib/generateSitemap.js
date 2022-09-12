import { writeFileSync } from 'fs'
import { globby } from 'globby'
import unixify from 'unixify'

function addPage(page) {
  const path = page
    .replace('src/pages', '')
    .replace('.jsx', '')
    .replace('.mdx', '')
    .replace('/index', '')
  const route = unixify(path)

  return `  <url>
    <loc>${`${process.env.NEXT_PUBLIC_SITE_URL}${route}`}</loc>
    <changefreq>hourly</changefreq>
  </url>`
}

export async function generateSitemap() {
  // Ignore Next.js specific files (e.g., _app.js) and API routes.
  const pages = await globby([
    'src/pages/**/*{.jsx,.mdx}',
    '!src/pages/_*.jsx',
    '!src/pages/api',
  ])
  const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(addPage).join('\n')}
</urlset>`

  writeFileSync('public/sitemap.xml', sitemap)
}
