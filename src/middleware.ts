import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { generateRssFeed } from '@/lib/generateRssFeed'
import { generateSitemap } from '@/lib/generateSitemap'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/feed.xml') {
    const rssFeed = (await generateRssFeed()).rss2()

    return new NextResponse(rssFeed, {
      headers: { 'Content-Type': 'text/xml' },
    })
  } else if (request.nextUrl.pathname === '/feed.json') {
    const rssFeed = (await generateRssFeed()).json1()

    return new NextResponse(rssFeed, {
      headers: { 'Content-Type': 'application/json' },
    })
  } else if (request.nextUrl.pathname === '/sitemap.xml') {
    const sitemap = await generateSitemap()

    return new NextResponse(sitemap, {
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}
