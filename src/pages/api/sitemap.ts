import type { NextRequest } from 'next/server'

import { generateSitemap } from '@/lib/generateSitemap'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  const sitemap = generateSitemap()

  return new Response(sitemap, {
    status: 200,
    headers: {
      'content-type': 'text/xml',
    },
  })
}
