import { withAxiom } from 'next-axiom'
import { withContentlayer } from 'next-contentlayer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['jsx', 'mdx', 'tsx', 'ts'],
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true,
    allowMiddlewareResponseBody: true,
  },
  async rewrites() {
    return [
      {
        source: '/feed.xml',
        destination: '/api/feed',
      },
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
    ]
  },
}

export default withAxiom(withContentlayer(nextConfig))
