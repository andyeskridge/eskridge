import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { generateSitemap } from '@/lib/generateSitemap'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/sitemap.xml') {
    const sitemap = generateSitemap()

    return new NextResponse(sitemap, {
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}
