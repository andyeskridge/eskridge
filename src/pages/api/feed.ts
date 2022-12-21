import { generateRssFeed } from '@/lib/generateRssFeed'
import type { NextRequest } from 'next/server'

export default async function handler(req: NextRequest) {
  const feed = generateRssFeed()

  return new Response(feed, {
    status: 200,
    headers: {
      'content-type': 'text/xml',
    },
  })
}
